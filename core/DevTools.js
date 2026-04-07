/**
 * DevTools
 * Debugging utilities para SimpleComponent y SimpleStore
 *
 * Acceso global:
 * $exonoor.stores['app'].inspect()
 * $exonoor.components['board'].inspect()
 * $exonoor.devtools.timeline
 */

class DevTools {
    constructor() {
        this.enabled = true
        this.timeline = []
        this.maxTimeline = 100
        this._registerGlobal()
    }

    _registerGlobal() {
        if (typeof window !== 'undefined') {
            window.$exonoor = {
                stores: new Map(),
                components: new Map(),
                devtools: this,
            }
        }
    }

    /**
     * Register store for debugging
     */
    registerStore(name, store) {
        if (typeof window === 'undefined') return
        window.$exonoor.stores.set(name, store)
        this._logTimeline(`Store registered: ${name}`)
    }

    /**
     * Register component for debugging
     */
    registerComponent(name, component) {
        if (typeof window === 'undefined') return
        window.$exonoor.components.set(name, component)
        this._logTimeline(`Component registered: ${name}`)
    }

    /**
     * Log state change
     */
    logStateChange(name, type, prevState, newState) {
        if (!this.enabled) return

        const changes = this._diffObjects(prevState, newState)
        this._logTimeline(`[${type}] ${name}`, changes)

        // Auto-expand for debugging
        if (typeof console !== 'undefined' && console.debug) {
            console.debug(`[${type}] ${name}`, { from: prevState, to: newState })
        }
    }

    /**
     * Log action
     */
    logAction(name, action, payload) {
        if (!this.enabled) return
        this._logTimeline(`[Action] ${name}.${action}`, payload)
    }

    /**
     * Log performance
     */
    logPerformance(name, duration) {
        if (!this.enabled) return
        const color = duration < 16 ? '🟢' : duration < 50 ? '🟡' : '🔴'
        this._logTimeline(`${color} ${name} (${duration}ms)`)
    }

    /**
     * Internal: add to timeline
     */
    _logTimeline(message, data = null) {
        const entry = {
            timestamp: new Date(),
            message,
            data,
        }

        this.timeline.push(entry)

        if (this.timeline.length > this.maxTimeline) {
            this.timeline.shift()
        }
    }

    /**
     * Diff two objects
     */
    _diffObjects(prev, curr) {
        const changes = {}

        for (const key in curr) {
            if (prev[key] !== curr[key]) {
                changes[key] = { from: prev[key], to: curr[key] }
            }
        }

        return changes
    }

    /**
     * Print timeline
     */
    printTimeline(limit = 20) {
        console.group('[DevTools Timeline]')

        const entries = this.timeline.slice(-limit)

        entries.forEach((entry) => {
            const time = entry.timestamp.toLocaleTimeString()
            console.log(`${time} ${entry.message}`, entry.data || '')
        })

        console.groupEnd()
    }

    /**
     * Export timeline
     */
    exportTimeline() {
        return this.timeline.map((entry) => ({
            ...entry,
            timestamp: entry.timestamp.toISOString(),
        }))
    }

    /**
     * Clear timeline
     */
    clearTimeline() {
        this.timeline = []
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            stores: window.$exonoor?.stores.size || 0,
            components: window.$exonoor?.components.size || 0,
            timelineLength: this.timeline.length,
            enabled: this.enabled,
        }
    }

    /**
     * Print stats
     */
    printStats() {
        const stats = this.getStats()
        console.group('[DevTools Stats]')
        console.table(stats)
        console.groupEnd()
    }

    /**
     * Inspect all stores
     */
    inspectStores() {
        if (!window.$exonoor?.stores.size) {
            console.log('[DevTools] No stores registered')
            return
        }

        console.group('[DevTools Stores]')

        window.$exonoor.stores.forEach((store, name) => {
            console.group(`Store: ${name}`)
            console.log('State:', store.getState())
            console.log('Subscribers:', store._subscribers.size)
            console.log('History:', store._history.length)
            console.groupEnd()
        })

        console.groupEnd()
    }

    /**
     * Inspect all components
     */
    inspectComponents() {
        if (!window.$exonoor?.components.size) {
            console.log('[DevTools] No components registered')
            return
        }

        console.group('[DevTools Components]')

        window.$exonoor.components.forEach((component, name) => {
            console.group(`Component: ${name}`)
            console.log('State:', component.state)
            console.log('Mounted:', component._mounted)
            console.log('Subscribers:', component._subscribers.length)
            console.log('DOM:', component.el)
            console.groupEnd()
        })

        console.groupEnd()
    }

    /**
     * Quick debug: show everything
     */
    debug() {
        console.clear()
        this.printStats()
        console.log('')
        this.inspectStores()
        console.log('')
        this.inspectComponents()
        console.log('')
        this.printTimeline()
    }

    /**
     * Help: show available commands
     */
    help() {
        console.log(`
    EliteUI DevTools Commands:

    Global access: window.$exonoor

    Stores:
      $exonoor.stores.get('name')          // Get store by name
      $exonoor.stores.forEach(...)         // Iterate stores

    Components:
      $exonoor.components.get('name')      // Get component by name
      $exonoor.components.forEach(...)     // Iterate components

    DevTools:
      $exonoor.devtools.debug()            // Full debug output
      $exonoor.devtools.help()             // This help
      $exonoor.devtools.inspectStores()    // All stores
      $exonoor.devtools.inspectComponents() // All components
      $exonoor.devtools.printTimeline()    // Event timeline
      $exonoor.devtools.printStats()       // Statistics
      $exonoor.devtools.clearTimeline()    // Clear timeline
      $exonoor.devtools.enabled = false    // Disable logging

    Example:
      const store = $exonoor.stores.get('app')
      store.debug()                        // Print store state

      const comp = $exonoor.components.get('board')
      comp.state                           // Get component state
      comp.setState({ ... })               // Update state
    `)
    }
}

// Auto-create global instance
const devTools = new DevTools()

// Extend SimpleComponent to register itself (mount only, no setState hook to prevent recursion)
if (typeof SimpleComponent !== 'undefined') {
    const originalMount = SimpleComponent.prototype.mount

    SimpleComponent.prototype.mount = function () {
        // Register in devtools if has name
        if (this.constructor.name && this.constructor.name !== 'SimpleComponent') {
            const displayName = this.name || this.constructor.name
            devTools.registerComponent(displayName, this)
        }

        return originalMount.call(this)
    }
}

// Extend SimpleStore to register itself (no setState hook to prevent recursion)
if (typeof SimpleStore !== 'undefined') {
    SimpleStore.prototype.setName = function (name) {
        this._name = name
        devTools.registerStore(name, this)
        return this
    }
}

window.DevTools = DevTools
window.$exonoor = window.$exonoor || { stores: new Map(), components: new Map(), devtools }

// Print help on first access
if (typeof console !== 'undefined') {
    console.log('%c[DevTools] EliteUI debugging enabled. Type $exonoor.devtools.help() for commands.', 'color: #4f6fff; font-weight: bold')
}
