/**
 * $debug - Debugging utilities con lifecycle tracking
 * 
 * Uso:
 * 
 * // Logging simple
 * $debug.log('User logged in', { userId: 123 })
 * $debug.warn('Rate limit approaching')
 * $debug.error('API failed', error)
 * 
 * // Lifecycle tracking
 * $debug.trackComponent('Hero', 'mount')
 * $debug.trackComponent('Hero', 'render')
 * $debug.trackComponent('Hero', 'unmount')
 * 
 * // Performance
 * $debug.time('api-request')
 * await $http('/users')
 * $debug.timeEnd('api-request')
 * 
 * // State snapshots
 * $debug.snapshot('state-before-login', store.getState())
 * 
 * // DevTools panel
 * $debug.panel() // Abre DevTools en el browser
 */

const $debug = {
  _enabled: true,
  _logs: [],
  _maxLogs: 100,
  _lifecycle: new Map(),
  _timers: new Map(),
  _listeners: [],

  // Enable/disable
  enable() { this._enabled = true },
  disable() { this._enabled = false },
  isEnabled() { return this._enabled },

  // Basic logging
  log(...args) {
    if (!this._enabled) return
    console.log(`[${timestamp()}]`, ...args)
    this._addLog('log', args)
  },

  warn(...args) {
    if (!this._enabled) return
    console.warn(`[${timestamp()}] ⚠️`, ...args)
    this._addLog('warn', args)
  },

  error(...args) {
    if (!this._enabled) return
    console.error(`[${timestamp()}] ❌`, ...args)
    this._addLog('error', args)
  },

  info(...args) {
    if (!this._enabled) return
    console.info(`[${timestamp()}] ℹ️`, ...args)
    this._addLog('info', args)
  },

  // Group logs
  group(name) {
    if (!this._enabled) return
    console.group(`[${timestamp()}] ${name}`)
  },
  groupEnd() {
    console.groupEnd()
  },

  // Lifecycle tracking
  trackComponent(name, event, data = {}) {
    if (!this._lifecycle.has(name)) {
      this._lifecycle.set(name, [])
    }

    const entry = {
      event,
      timestamp: Date.now(),
      data
    }

    this._lifecycle.get(name).push(entry)

    // Keep last 50 entries per component
    const entries = this._lifecycle.get(name)
    if (entries.length > 50) entries.shift()

    // Log if enabled
    if (this._enabled) {
      const icon = event === 'mount' ? '🚀' : event === 'unmount' ? '🛑' : event === 'error' ? '💥' : '📦'
      console.log(`[${timestamp()}] ${icon} ${name}:${event}`, data)
    }

    // Notify listeners
    this._notify('lifecycle', { name, event, data, timestamp: entry.timestamp })
  },

  // Get lifecycle history
  getLifecycle(name) {
    return name ? this._lifecycle.get(name) || [] : Object.fromEntries(this._lifecycle)
  },

  // Clear lifecycle for component
  clearLifecycle(name) {
    if (name) {
      this._lifecycle.delete(name)
    } else {
      this._lifecycle.clear()
    }
  },

  // Timer utilities
  time(label) {
    this._timers.set(label, Date.now())
  },

  timeEnd(label) {
    const start = this._timers.get(label)
    if (start) {
      const duration = Date.now() - start
      this._timers.delete(label)
      const msg = `${label}: ${duration}ms`
      if (duration > 1000) {
        this.warn(`⏱️ ${msg}`)
      } else {
        this.log(`⏱️ ${msg}`)
      }
      return duration
    }
    this.warn(`Timer '${label}' was not started`)
    return null
  },

  // State snapshots
  snapshot(label, state) {
    this._addLog('snapshot', { label, state, timestamp: Date.now() })
    if (this._enabled) {
      console.log(`[${timestamp()}] 📸 Snapshot: ${label}`, state)
    }
  },

  // Subscribe to events
  on(event, callback) {
    this._listeners.push({ event, callback })
    return () => {
      this._listeners = this._listeners.filter(l => l.event !== event || l.callback !== callback)
    }
  },

  // Get all logs
  getLogs() {
    return [...this._logs]
  },

  // Clear logs
  clearLogs() {
    this._logs = []
  },

  // Export logs
  exportLogs() {
    const logs = this.getLogs()
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eliteui-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    this.log('Logs exported')
  },

  // DevTools panel (simple table view)
  panel() {
    if (!this._enabled) return

    console.log('\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║                    EliteUI DevTools                            ║')
    console.log('╠══════════════════════════════════════════════════════════════╣')

    // Components
    console.log('║ COMPONENTS                                                    ║')
    for (const [name, entries] of this._lifecycle) {
      const last = entries[entries.length - 1]
      const total = entries.length
      console.log(`║   ${pad(name, 15)} │ ${pad(last?.event || 'none', 10)} │ ${total} events`)
    }

    console.log('╠══════════════════════════════════════════════════════════════╣')

    // Recent logs
    console.log('║ RECENT LOGS                                                   ║')
    const recent = this._logs.slice(-10)
    for (const log of recent) {
      const icon = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : 'ℹ️'
      const msg = log.data.slice(0, 3).map(d => typeof d === 'object' ? JSON.stringify(d) : String(d)).join(' ')
      console.log(`║ ${icon} ${pad(msg.substring(0, 50), 50)}`)
    }

    console.log('╠══════════════════════════════════════════════════════════════╣')
    console.log('║ Commands: $debug.exportLogs() | $debug.clearLogs()           ║')
    console.log('╚══════════════════════════════════════════════════════════════╝\n')
  },

  // Internal
  _addLog(type, data) {
    this._logs.push({ type, data, timestamp: Date.now() })
    if (this._logs.length > this._maxLogs) {
      this._logs.shift()
    }
  },

  _notify(event, data) {
    for (const listener of this._listeners) {
      if (listener.event === event) {
        try {
          listener.callback(data)
        } catch (e) {
          console.error('[$debug] listener error:', e)
        }
      }
    }
  }
}

// Helper
function timestamp() {
  return new Date().toISOString().substring(11, 23)
}

function pad(str, len) {
  return String(str).padEnd(len).substring(0, len)
}

// Auto-detect dev mode
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.search.includes('debug')) {
  $debug.enable()
  console.log('[$debug] Dev mode enabled')
} else {
  $debug.disable()
}

// Export
window.$debug = $debug

console.log('[$debug] Debug tools ready')
