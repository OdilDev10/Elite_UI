/**
 * SimpleStore
 * Global state management (similar a Zustand, pero sin dependencias)
 *
 * Propiedades:
 * - getState() / setState()
 * - subscribe(path, callback) - subscribe a cambios en path específico
 * - computed: valores derivados del estado
 * - persistencia: localStorage/sessionStorage
 *
 * Uso:
 * const store = new SimpleStore({ count: 0 })
 * store.subscribe('count', (newVal, prevVal) => console.log(newVal))
 * store.setState({ count: 1 })
 */

class SimpleStore {
  constructor(initialState = {}, options = {}) {
    this._state = initialState
    this._subscribers = new Map() // path -> [callbacks]
    this._pathSubscribers = new Map() // deep path (dot notation) -> callback
    this._computed = new Map()
    this._computedCache = new Map()
    this._history = []
    this._redoHistory = []
    this._maxHistory = options.maxHistory || 50
    this._persistKey = options.persistKey || null

    // Restaurar del storage si está configurado
    if (this._persistKey) {
      this._restore()
    }

    // Devtools support (si existe window.__EXONOOR_DEVTOOLS__)
    if (typeof window !== 'undefined' && window.__EXONOOR_DEVTOOLS__) {
      window.__EXONOOR_DEVTOOLS__.registerStore(this)
    }
  }

  /**
   * Get state (snapshot)
   */
  getState() {
    return JSON.parse(JSON.stringify(this._state))
  }

  /**
   * Get value by path (dot notation)
   * getValue('user.profile.name')
   */
  getValue(path) {
    return this._getValueByPath(this._state, path)
  }

  _getValueByPath(obj, path) {
    if (!path) return obj
    return path.split('.').reduce((o, p) => o?.[p], obj)
  }

  /**
   * Set state (merge)
   */
  setState(updates) {
    if (typeof updates === 'function') {
      updates = updates(this._state)
    }

    const prevState = this._state
    const prevStateClone = JSON.parse(JSON.stringify(prevState))

    // Detectar cambios antes de actualizar
    const changes = {}
    for (const key in updates) {
      if (this._state[key] !== updates[key]) {
        changes[key] = true
      }
    }

    if (Object.keys(changes).length === 0) return // No-op

    // Clear redo history when making a new change
    this._redoHistory = []

    // Actualizar estado
    this._state = { ...this._state, ...updates }

    // Guardar en history
    this._history.push({
      timestamp: Date.now(),
      prevState: prevStateClone,
      newState: JSON.parse(JSON.stringify(this._state))
    })
    if (this._history.length > this._maxHistory) {
      this._history.shift()
    }

    // Notificar subscribers
    this._notify(prevState, this._state, Object.keys(changes))

    // Persistir si está configurado
    if (this._persistKey) {
      this._persist()
    }
  }

  /**
   * Subscribe a cambios de un path
   * Soporta keys top-level y paths profundos con dot notation
   * @param {string} path - 'user.name' para deep paths, 'key' para top-level, '*' para todos
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  subscribe(path = '*', callback) {
    // Deep path subscriber (dot notation like 'user.name')
    if (path !== '*' && path.includes('.')) {
      if (!this._pathSubscribers.has(path)) {
        this._pathSubscribers.set(path, [])
      }
      this._pathSubscribers.get(path).push(callback)

      return () => {
        const callbacks = this._pathSubscribers.get(path)
        this._pathSubscribers.set(path, callbacks.filter(cb => cb !== callback))
      }
    }

    // Top-level key or global subscriber
    if (!this._subscribers.has(path)) {
      this._subscribers.set(path, [])
    }

    this._subscribers.get(path).push(callback)

    // Retornar función de unsubscribe
    return () => {
      const callbacks = this._subscribers.get(path)
      this._subscribers.set(path, callbacks.filter(cb => cb !== callback))
    }
  }

  _notify(prevState, currState, changedKeys) {
    // Notificar subscribers específicos
    for (const key of changedKeys) {
      const callbacks = this._subscribers.get(key) || []
      const prevVal = this._getValueByPath(prevState, key)
      const currVal = this._getValueByPath(currState, key)

      callbacks.forEach(cb => {
        try {
          cb(currVal, prevVal, key)
        } catch (e) {
          console.error('[SimpleStore] subscriber error:', e)
        }
      })
    }

    // Notificar subscribers globales
    const globalCallbacks = this._subscribers.get('*') || []
    globalCallbacks.forEach(cb => {
      try {
        cb(currState, prevState)
      } catch (e) {
        console.error('[SimpleStore] subscriber error:', e)
      }
    })

    // Notificar deep path subscribers (dot notation like 'user.name')
    this._pathSubscribers.forEach((callbacks, path) => {
      const prevVal = this._getValueByPath(prevState, path)
      const currVal = this._getValueByPath(currState, path)

      // Only notify if the value at this path actually changed
      if (prevVal !== currVal) {
        callbacks.forEach(cb => {
          try {
            cb(currVal, prevVal, path)
          } catch (e) {
            console.error('[SimpleStore] subscriber error:', e)
          }
        })
      }
    })

    // Invalidar computed cache
    this._computedCache.clear()
  }

  /**
   * Definir valor computado
   * @param {string} key
   * @param {Function} computeFn - (state) => value
   */
  defineComputed(key, computeFn) {
    this._computed.set(key, computeFn)
    // Evaluar una vez para cachear
    this._computedCache.set(key, computeFn(this._state))
  }

  /**
   * Get computed value
   */
  getComputed(key) {
    if (!this._computed.has(key)) {
      return undefined
    }

    if (this._computedCache.has(key)) {
      return this._computedCache.get(key)
    }

    const computeFn = this._computed.get(key)
    const value = computeFn(this._state)
    this._computedCache.set(key, value)
    return value
  }

  /**
   * Batch updates (solo notifica una vez al final)
   */
  batch(updatesFn) {
    const prevState = this._state

    // Acumular cambios sin notificar
    const updates = {}
    const tempSetState = (u) => {
      Object.assign(updates, typeof u === 'function' ? u(this._state) : u)
    }

    // Llamar callback con setState temporal
    updatesFn(tempSetState)

    // Ahora actualizar de verdad
    if (Object.keys(updates).length > 0) {
      this._state = { ...this._state, ...updates }
      this._notify(prevState, this._state, Object.keys(updates))

      if (this._persistKey) {
        this._persist()
      }
    }
  }

  /**
   * Undo to previous state
   * Pushes current state onto redo history
   */
  undo() {
    if (this._history.length > 0) {
      const entry = this._history.pop()
      // Save current state for redo
      this._redoHistory.push({
        prevState: entry.prevState,
        newState: entry.newState
      })
      this._state = entry.prevState
      this._notify(entry.newState, this._state, Object.keys(entry.prevState))
    }
  }

  /**
   * Redo to next state
   * Pops from redo history and restores the state
   */
  redo() {
    if (this._redoHistory.length > 0) {
      const entry = this._redoHistory.pop()
      // Save previous state back onto history for undo
      this._history.push({
        prevState: entry.prevState,
        newState: entry.newState
      })
      this._state = entry.newState
      this._notify(entry.prevState, this._state, Object.keys(entry.newState))
    }
  }

  /**
   * Get history
   */
  getHistory() {
    return [...this._history]
  }

  /**
   * Persistencia
   */
  _persist() {
    try {
      if (typeof window === 'undefined') return
      const storage = window.localStorage || window.sessionStorage
      storage.setItem(this._persistKey, JSON.stringify(this._state))
    } catch (e) {
      console.warn('[SimpleStore] persist failed:', e)
    }
  }

  _restore() {
    try {
      if (typeof window === 'undefined') return
      const storage = window.localStorage || window.sessionStorage
      const saved = storage.getItem(this._persistKey)
      if (saved) {
        this._state = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('[SimpleStore] restore failed:', e)
    }
  }

  /**
   * Clear storage
   */
  clearPersistence() {
    if (typeof window === 'undefined') return
    const storage = window.localStorage || window.sessionStorage
    storage.removeItem(this._persistKey)
  }

  /**
   * Reset a estado inicial
   */
  reset(initialState) {
    this._state = initialState
    this._computedCache.clear()
    this._notify({}, this._state, Object.keys(initialState))
  }

  /**
   * Debug: imprimir estado actual
   */
  debug() {
    console.group(`[SimpleStore] State`)
    console.table(this._state)
    console.groupEnd()
  }
}

window.SimpleStore = SimpleStore
