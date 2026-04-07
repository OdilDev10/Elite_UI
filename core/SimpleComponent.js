/**
 * SimpleComponent
 * Base class para todos los componentes del framework.
 *
 * Propiedades:
 * - state: objeto reativo con getter/setter
 * - lifecycle hooks: mount, unmount, update
 * - event delegation: on(), off()
 * - templating: html``
 * - side effects: useEffect()
 *
 * No requiere dependencias externas.
 */

class SimpleComponent {
  constructor(selector, initialState = {}) {
    // Resolver selector
    this.el = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector

    if (!this.el) {
      console.warn(`[SimpleComponent] selector not found:`, selector)
    }

    // Props (immutable from component perspective, updatable from parent)
    this._props = {}

    // Estado reactivo
    this._state = initialState
    this._subscribers = []
    this._effectDependencies = new Map()
    this._prevState = null

    // Lifecycle
    this._mounted = false
    this._unmounted = false

    // Event delegation
    this._eventListeners = []

    // Child components (for automatic cleanup)
    this._children = []

    // Lazy load resources
    this._resources = new Map()
    this._loadingPromises = new Map()

    // Error boundary
    this._errorBoundary = null
  }

  /**
   * Acceso a estado
   */
  get state() {
    return { ...this._state }
  }

  /**
   * Actualizar estado (reactivo)
   * Dispara render + subscribers
   */
  setState(updates) {
    if (typeof updates === 'function') {
      updates = updates(this._state)
    }

    const prevState = this._state
    const hasChanges = Object.keys(updates).some(key =>
      this._state[key] !== updates[key]
    )

    if (!hasChanges) return // No-op si no hay cambios

    this._prevState = prevState
    this._state = { ...this._state, ...updates }

    this.onStateChange?.(this._state, prevState)
    this.render()
    this._notifySubscribers(prevState, this._state)
  }

  /**
   * Subscribe to state changes
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this._subscribers.push(callback)
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback)
    }
  }

  _notifySubscribers(prev, curr) {
    this._subscribers.forEach(cb => {
      try {
        cb(curr, prev)
      } catch (e) {
        console.error('[SimpleComponent] subscriber error:', e)
      }
    })
  }

  /**
   * Update props reactively (called by parent)
   * Triggers onPropsChange() and re-render if already mounted
   * Uses shouldRender() to allow memoization (similar to React.memo)
   */
  setProps(updates) {
    const prev = { ...this._props }
    const next = { ...this._props, ...updates }
    const hasChanges = Object.keys(updates).some(k => this._props[k] !== updates[k])

    if (!hasChanges) return

    // Check if component wants to render with new props
    if (!this.shouldRender(next, prev)) return

    this._props = next
    this.onPropsChange(this._props, prev)

    if (this._mounted) {
      this.render()
    }
  }

  /**
   * Lifecycle: Props change
   * Override en subclases para reaccionar a cambios de props
   */
  onPropsChange(newProps, prevProps) {
    // Override en subclases
  }

  /**
   * Decide whether to re-render on props change
   * Similar to React.memo - return false to skip render
   * Default: always re-render
   * Override in subclass to implement memoization
   */
  shouldRender(newProps, prevProps) {
    return true
  }

  /**
   * Create a mutable reference that doesn't trigger re-render
   * Similar to React.useRef
   */
  useRef(initialValue = null) {
    if (!this._refs) this._refs = []
    const ref = { current: initialValue }
    this._refs.push(ref)
    return ref
  }

  /**
   * Register child component for automatic cleanup on unmount
   */
  registerChild(component) {
    this._children.push(component)
    return component
  }

  /**
   * Emit custom event that bubbles to parent
   */
  emit(eventName, detail = {}) {
    const event = new CustomEvent(`elite:${eventName}`, {
      detail,
      bubbles: true,
      composed: true
    })
    this.el?.dispatchEvent(event)
  }

  /**
   * Side effects (similar a useEffect)
   * @param {Function} effect
   * @param {Array} dependencies
   */
  useEffect(effect, dependencies = []) {
    // Assign unique key to each effect call to prevent collisions from identical closures
    if (!effect.__eliteEffectKey) {
      effect.__eliteEffectKey = Symbol('elite-effect-' + Date.now() + Math.random())
    }
    const key = effect.__eliteEffectKey

    const prev = this._effectDependencies.get(key) || []

    const hasChanged = dependencies.length === 0 ||
      dependencies.some((dep, i) => dep !== prev[i])

    if (hasChanged) {
      try {
        const cleanup = effect()
        if (typeof cleanup === 'function') {
          // Store cleanup for unmount
          if (!this._cleanups) this._cleanups = []
          this._cleanups.push(cleanup)
        }
      } catch (e) {
        console.error('[SimpleComponent] effect error:', e)
      }
      this._effectDependencies.set(key, dependencies)
    }
  }

  /**
   * Event delegation
   * @param {string} event - 'click', 'change', etc.
   * @param {string} selector - CSS selector
   * @param {Function} handler
   */
  on(event, selector, handler) {
    const listener = (e) => {
      if (e.target.matches(selector)) {
        try {
          handler.call(this, e)
        } catch (err) {
          console.error('[SimpleComponent] event handler error:', err)
        }
      }
    }

    this.el?.addEventListener(event, listener)
    this._eventListeners.push({ event, listener })
  }

  /**
   * Remove event listener
   */
  off(event, handler) {
    this._eventListeners = this._eventListeners.filter(item => {
      if (item.event === event) {
        this.el?.removeEventListener(event, item.listener)
        return false
      }
      return true
    })
  }

  /**
   * Load template by ID and replace {{placeholder}} with data
   * First looks for <template id="tmpl-ComponentName"> in DOM
   * Falls back to fetching components/ComponentName/ComponentName.html
   * @param {string} templateId - Without "tmpl-" prefix (e.g., "CodeCard" for id="tmpl-CodeCard")
   * @param {Object} data - Key-value pairs to replace {{key}} in template
   * @returns {string} Rendered HTML
   */
  async loadTemplate(templateId, data = {}) {
    const fullId = `tmpl-${templateId}`
    let tmpl = document.getElementById(fullId)
    let html = ''

    if (tmpl) {
      html = tmpl.innerHTML
    } else {
      // Try to load from component's HTML file
      try {
        const path = `components/${templateId}/${templateId}.html`
        const res = await fetch(path)
        if (res.ok) {
          html = await res.text()
        } else {
          console.warn(`[SimpleComponent] Template not found: #${fullId} or ${path}`)
          return ''
        }
      } catch (e) {
        console.warn(`[SimpleComponent] Template not found: #${fullId}`)
        return ''
      }
    }

    Object.entries(data).forEach(([key, val]) => {
      const escaped = typeof val === 'string' ? this._escapeHtml(val) : String(val ?? '')
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), escaped)
    })
    return html
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  _escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Lazy load a resource
   * @param {string} resourceId
   * @param {Function} loader - () => Promise<data>
   */
  async lazyLoad(resourceId, loader) {
    if (this._resources.has(resourceId)) {
      return this._resources.get(resourceId)
    }

    if (this._loadingPromises.has(resourceId)) {
      return this._loadingPromises.get(resourceId)
    }

    const promise = Promise.resolve()
      .then(() => loader())
      .then(data => {
        this._resources.set(resourceId, data)
        return data
      })
      .catch(err => {
        console.error(`[SimpleComponent] lazy load failed (${resourceId}):`, err)
        throw err
      })

    this._loadingPromises.set(resourceId, promise)

    try {
      return await promise
    } finally {
      this._loadingPromises.delete(resourceId)
    }
  }

  /**
   * Set error boundary handler
   */
  setErrorBoundary(handler) {
    this._errorBoundary = handler
  }

  _handleError(error) {
    if (this._errorBoundary) {
      this._errorBoundary(error, this)
    } else {
      console.error('[SimpleComponent] unhandled error:', error)
    }
  }

  /**
   * Lifecycle: Mount
   * Llamado automáticamente en mount()
   */
  onMount() {
    // Override en subclases
  }

  /**
   * Lifecycle: Unmount
   * Llamado automáticamente en unmount()
   */
  onUnmount() {
    // Override en subclases
  }

  /**
   * Lifecycle: State change
   * Llamado cuando setState() actualiza el estado
   */
  onStateChange(newState, prevState) {
    // Override en subclases
  }

  /**
   * Render (debe override)
   */
  render() {
    if (!this.el) return
    console.warn('[SimpleComponent] render() not implemented')
  }

  /**
   * Mount component
   */
  mount() {
    if (this._mounted) return

    const componentName = this.constructor.name

    try {
      $debug?.trackComponent(componentName, 'mount', { selector: this.el?.id || this.el?.className || 'unknown' })
      this.render()
      this.onMount()
      this._mounted = true
      $debug?.trackComponent(componentName, 'mounted')
    } catch (e) {
      $debug?.trackComponent(componentName, 'error', { error: e.message })
      this._handleError(e)
    }
  }

  /**
   * Unmount component (cleanup)
   */
  unmount() {
    if (this._unmounted) return

    const componentName = this.constructor.name
    $debug?.trackComponent(componentName, 'unmount')

    try {
      this.onUnmount()

      // Unmount child components
      this._children.forEach(child => {
        try {
          child.unmount()
        } catch (e) {
          $debug?.trackComponent(child.constructor.name, 'error', { error: e.message })
          console.error('[SimpleComponent] child unmount error:', e)
        }
      })
      this._children = []

      // Clean up refs
      if (this._refs) {
        this._refs.forEach(ref => {
          ref.current = null
        })
        this._refs = []
      }

      // Run cleanup functions
      if (this._cleanups) {
        this._cleanups.forEach(cleanup => {
          try {
            cleanup()
          } catch (e) {
            console.error('[SimpleComponent] cleanup error:', e)
          }
        })
      }

      // Remove all event listeners
      this._eventListeners.forEach(({ event, listener }) => {
        this.el?.removeEventListener(event, listener)
      })
      this._eventListeners = []

      // Clear subscribers
      this._subscribers = []

      this._unmounted = true
      $debug?.trackComponent(componentName, 'unmounted')
    } catch (e) {
      $debug?.trackComponent(componentName, 'error', { error: e.message })
      this._handleError(e)
    }
  }

  /**
   * Forzar re-render sin cambiar estado
   */
  forceUpdate() {
    try {
      this.render()
    } catch (e) {
      this._handleError(e)
    }
  }
}

window.SimpleComponent = SimpleComponent
