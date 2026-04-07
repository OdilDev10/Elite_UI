/**
 * Context
 * Compartir estado entre componentes sin prop drilling
 *
 * Uso:
 * const UserContext = new Context({ user: null })
 * userContext.subscribe(callback)
 * userContext.provide({ user: { id: 1, name: 'Juan' } })
 */

class Context {
  constructor(initialValue = {}) {
    this._value = initialValue
    this._subscribers = []
    this._providers = []
    this._watchers = new Map()

    // Dev tools
    this._debugName = 'Context'
    this._history = []
  }

  /**
   * Set debug name
   */
  setName(name) {
    this._debugName = name
    return this
  }

  /**
   * Get value
   */
  getValue() {
    return { ...this._value }
  }

  /**
   * Provide value (update)
   */
  provide(value) {
    const prevValue = this._value
    this._value = { ...this._value, ...value }

    // History
    this._history.push({
      timestamp: Date.now(),
      prevValue,
      newValue: this._value
    })
    if (this._history.length > 100) this._history.shift()

    // Notify
    this._notify(prevValue, this._value)
  }

  /**
   * Subscribe a cambios
   * @returns {Function} unsubscribe
   */
  subscribe(callback) {
    this._subscribers.push(callback)
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback)
    }
  }

  /**
   * Watch específico
   * @param {string|Array} keys - 'user' o ['user', 'auth']
   * @param {Function} callback
   * @returns {Function} unwatch
   */
  watch(keys, callback) {
    const keyList = Array.isArray(keys) ? keys : [keys]
    const key = keyList.join('|')

    if (!this._watchers.has(key)) {
      this._watchers.set(key, [])
    }

    this._watchers.get(key).push({ keyList, callback })

    return () => {
      const watchers = this._watchers.get(key)
      this._watchers.set(key, watchers.filter(w => w.callback !== callback))
    }
  }

  _notify(prevValue, currValue) {
    // Global subscribers
    this._subscribers.forEach(cb => {
      try {
        cb(currValue, prevValue)
      } catch (e) {
        console.error(`[${this._debugName}] subscriber error:`, e)
      }
    })

    // Specific watchers
    for (const [key, watchers] of this._watchers.entries()) {
      watchers.forEach(({ keyList, callback }) => {
        const prevVals = keyList.map(k => prevValue?.[k])
        const currVals = keyList.map(k => currValue?.[k])

        const hasChanged = prevVals.some((v, i) => v !== currVals[i])

        if (hasChanged) {
          try {
            callback(...currVals, ...prevVals)
          } catch (e) {
            console.error(`[${this._debugName}] watcher error:`, e)
          }
        }
      })
    }
  }

  /**
   * Use context in component
   * Convenience method para obtener valor + unsubscribe
   */
  use(callback) {
    callback(this._value)
    return this.subscribe(callback)
  }

  /**
   * Provider (para HTML atributos)
   */
  createProvider(value = {}) {
    const provider = {
      value: { ...this._value, ...value },
      children: []
    }
    this._providers.push(provider)
    this.provide(provider.value)
    return provider
  }

  /**
   * Consumer helpers
   */
  connect(component) {
    if (typeof component === 'function') {
      // Function component
      return this.subscribe((value) => {
        component(value)
      })
    } else if (component?.setState) {
      // Class component con setState
      return this.subscribe((value) => {
        component.setState({ ...value })
      })
    }
  }

  /**
   * Reset a valor inicial
   */
  reset(initialValue) {
    this._value = initialValue
    this._notify({}, this._value)
  }

  /**
   * Get history
   */
  getHistory() {
    return [...this._history]
  }

  /**
   * Debug
   */
  debug() {
    console.group(`[${this._debugName}]`)
    console.log('Current value:', this._value)
    console.log('Subscribers:', this._subscribers.length)
    console.log('Watchers:', this._watchers.size)
    console.log('History:', this._history.length)
    console.groupEnd()
  }
}

// Composite Context para múltiples contextos
class ContextProvider {
  constructor(contexts = {}) {
    this._contexts = contexts
  }

  addContext(name, context) {
    this._contexts[name] = context
    return this
  }

  getContext(name) {
    return this._contexts[name]
  }

  getAllContexts() {
    return { ...this._contexts }
  }

  debug() {
    console.group('[ContextProvider]')
    for (const [name, ctx] of Object.entries(this._contexts)) {
      console.log(`${name}:`)
      ctx.debug()
    }
    console.groupEnd()
  }
}

window.Context = Context
window.ContextProvider = ContextProvider
