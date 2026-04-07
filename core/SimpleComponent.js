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
    this._processDirectives(this.el)
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
   * Load template from DOM (no fetch for file:// compatibility)
   */
  loadTemplate(templateId) {
    const fullId = `tmpl-${templateId}`
    const tmpl = document.getElementById(fullId)
    
    if (tmpl) {
      return tmpl.innerHTML
    }
    
    console.warn(`[SimpleComponent] Template not found: ${templateId}`)
    return ''
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
      this._processDirectives(this.el)
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

  /**
   * Evalúa una expresión en el contexto del estado y props del componente
   * @param {string} expr - Expresión JavaScript (ej: "count > 5" o "name === 'John'")
   * @returns {any} Resultado de la evaluación
   */
  _evalExpr(expr) {
    try {
      const state = this._state
      const props = this._props
      // Usamos 'with' para que las claves de state y props estén disponibles en el scope de la expresión
      return new Function('state', 'props', `with(props) { with(state) { return (${expr}) } }`)(state, props)
    } catch (e) {
      console.warn(`[SimpleComponent] expression eval error: "${expr}"`, e.message)
      return undefined
    }
  }

  /**
   * Procesa directivas data-* en el DOM
   * Se llama automáticamente después de cada render()
   *
   * Directivas soportadas:
   * - data-if="expr" → muestra/oculta con display:none
   * - data-show="expr" → muestra/oculta con visibility (mantiene layout)
   * - data-text="key" → escribe state[key] como textContent
   * - data-bind="key" → two-way binding en inputs
   * - data-class-X="expr" → toggle de clase X según expr
   * - data-onclick="method" → llama this[method](e) al hacer click
   * - data-link="/path" → navega sin reload via router
   */
  _processDirectives(root = this.el) {
    if (!root) return

    try {
      // data-if: muestra/oculta con display:none
      root.querySelectorAll('[data-if]').forEach(el => {
        el.style.display = this._evalExpr(el.dataset.if) ? '' : 'none'
      })

      // data-show: muestra/oculta con visibility (mantiene layout)
      root.querySelectorAll('[data-show]').forEach(el => {
        el.style.visibility = this._evalExpr(el.dataset.show) ? '' : 'hidden'
      })

      // data-text: escribe state[key] como textContent (XSS-safe)
      root.querySelectorAll('[data-text]').forEach(el => {
        const key = el.dataset.text
        const val = this._state[key] ?? this._props?.[key] ?? ''
        el.textContent = val
      })

      // data-bind: two-way binding (solo primera vez, luego los listeners persisten)
      root.querySelectorAll('[data-bind]').forEach(el => {
        const key = el.dataset.bind
        const isFormElement = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'

        if (isFormElement) {
          el.value = this._state[key] ?? ''

          // Registrar listener solo una vez (flag privado en el elemento)
          if (!el.__eliteDirectiveBound) {
            el.__eliteDirectiveBound = true
            el.addEventListener('input', e => {
              this.setState({ [key]: e.target.value })
            })
          }
        }
      })

      // data-class-X="expr": toggle de clase según expresión
      root.querySelectorAll('*').forEach(el => {
        Object.keys(el.dataset).forEach(key => {
          if (key.startsWith('class')) {
            // Convertir camelCase a kebab-case para nombres de clase
            // data-classActive -> className "active"
            // data-classIsPrimary -> className "is-primary"
            const className = key
              .slice(5)  // "classActive" -> "Active"
              .replace(/([A-Z])/g, '-$1')  // "Active" -> "-Active"
              .toLowerCase()  // "-active"
              .replace(/^-/, '')  // "active"

            const shouldAdd = this._evalExpr(el.dataset[key])
            el.classList.toggle(className, !!shouldAdd)
          }
        })
      })

      // data-onclick="method": registra click handler
      root.querySelectorAll('[data-onclick]').forEach(el => {
        if (!el.__eliteDirectiveOnclick) {
          el.__eliteDirectiveOnclick = true
          const methodName = el.dataset.onclick

          el.addEventListener('click', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onclick handler error (${methodName}):`, err)
              }
            } else {
              console.warn(`[SimpleComponent] method not found: ${methodName}`)
            }
          })
        }
      })

      // data-link="/path": navega sin reload
      root.querySelectorAll('[data-link]').forEach(el => {
        if (!el.__eliteDirectiveLink) {
          el.__eliteDirectiveLink = true

          el.addEventListener('click', e => {
            e.preventDefault()
            const path = el.dataset.link
            if (window.$router?.navigate) {
              window.$router.navigate(path)
            } else {
              console.warn('[SimpleComponent] Router not available for data-link')
            }
          })
        }
      })

      // data-html: renderiza el resultado de la expresión como HTML (⚠️ XSS risk)
      root.querySelectorAll('[data-html]').forEach(el => {
        const expr = el.dataset.html
        const val = this._evalExpr(expr)
        el.innerHTML = val ?? ''
      })

      // data-disabled="expr": desactiva elemento
      root.querySelectorAll('[data-disabled]').forEach(el => {
        const shouldDisable = this._evalExpr(el.dataset.disabled)
        el.disabled = !!shouldDisable
      })

      // data-value="key": establece value (lectura, no two-way)
      root.querySelectorAll('[data-value]').forEach(el => {
        const key = el.dataset.value
        const val = this._state[key] ?? this._props?.[key] ?? ''
        el.value = val
      })

      // data-checked="expr": para checkboxes/radios
      root.querySelectorAll('[data-checked]').forEach(el => {
        const isChecked = this._evalExpr(el.dataset.checked)
        el.checked = !!isChecked
      })

      // data-placeholder="key": placeholder dinámico
      root.querySelectorAll('[data-placeholder]').forEach(el => {
        const key = el.dataset.placeholder
        const val = this._state[key] ?? this._props?.[key] ?? ''
        el.placeholder = val
      })

      // data-title="key": atributo title dinámico
      root.querySelectorAll('[data-title]').forEach(el => {
        const key = el.dataset.title
        const val = this._state[key] ?? this._props?.[key] ?? ''
        el.title = val
      })

      // data-href="key": href dinámico
      root.querySelectorAll('[data-href]').forEach(el => {
        const key = el.dataset.href
        const val = this._state[key] ?? this._props?.[key] ?? '#'
        el.href = val
      })

      // data-src="key": src dinámico (imágenes, iframes, etc)
      root.querySelectorAll('[data-src]').forEach(el => {
        const key = el.dataset.src
        const val = this._state[key] ?? this._props?.[key] ?? ''
        el.src = val
      })

      // data-attr-*="key": atributos dinámicos genéricos
      // Ejemplo: data-attr-aria-label="message", data-attr-data-id="userId"
      root.querySelectorAll('*').forEach(el => {
        Object.keys(el.dataset).forEach(key => {
          if (key.startsWith('attr')) {
            // data-attrAriaLabel -> aria-label
            // data-attrDataId -> data-id
            const attrName = key
              .slice(4)  // "attrAriaLabel" -> "AriaLabel"
              .replace(/([A-Z])/g, '-$1')  // "AriaLabel" -> "-Aria-Label"
              .toLowerCase()  // "-aria-label"
              .replace(/^-/, '')  // "aria-label"

            const val = this._evalExpr(el.dataset[key])
            el.setAttribute(attrName, val ?? '')
          }
        })
      })

      // data-style-*: estilos dinámicos
      // Ejemplo: data-style-color="color", data-style-font-size="fontSize"
      root.querySelectorAll('*').forEach(el => {
        Object.keys(el.dataset).forEach(key => {
          if (key.startsWith('style')) {
            // data-styleColor -> --color o color
            // data-styleFontSize -> --font-size o fontSize
            let cssKey = key
              .slice(5)  // "styleColor" -> "Color"
              .replace(/([A-Z])/g, '-$1')  // "Color" -> "-Color"
              .toLowerCase()  // "-color"
              .replace(/^-/, '')  // "color"

            // Convertir kebab-case a camelCase para cssText
            const camelKey = cssKey.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

            const val = this._evalExpr(el.dataset[key])
            if (val !== undefined && val !== null) {
              el.style[camelKey] = val
            }
          }
        })
      })

      // data-onchange="method": listener para change events
      root.querySelectorAll('[data-onchange]').forEach(el => {
        if (!el.__eliteDirectiveOnchange) {
          el.__eliteDirectiveOnchange = true
          const methodName = el.dataset.onchange

          el.addEventListener('change', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onchange handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-oninput="method": listener para input events
      root.querySelectorAll('[data-oninput]').forEach(el => {
        if (!el.__eliteDirectiveOninput) {
          el.__eliteDirectiveOninput = true
          const methodName = el.dataset.oninput

          el.addEventListener('input', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] oninput handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-onkeyup="method": listener para keyup events
      root.querySelectorAll('[data-onkeyup]').forEach(el => {
        if (!el.__eliteDirectiveOnkeyup) {
          el.__eliteDirectiveOnkeyup = true
          const methodName = el.dataset.onkeyup

          el.addEventListener('keyup', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onkeyup handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-onkeydown="method": listener para keydown events
      root.querySelectorAll('[data-onkeydown]').forEach(el => {
        if (!el.__eliteDirectiveOnkeydown) {
          el.__eliteDirectiveOnkeydown = true
          const methodName = el.dataset.onkeydown

          el.addEventListener('keydown', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onkeydown handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-onhover="method": listener para mouse enter/leave
      root.querySelectorAll('[data-onhover]').forEach(el => {
        if (!el.__eliteDirectiveOnhover) {
          el.__eliteDirectiveOnhover = true
          const methodName = el.dataset.onhover

          el.addEventListener('mouseenter', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onhover handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-onfocus="method": listener para focus events
      root.querySelectorAll('[data-onfocus]').forEach(el => {
        if (!el.__eliteDirectiveOnfocus) {
          el.__eliteDirectiveOnfocus = true
          const methodName = el.dataset.onfocus

          el.addEventListener('focus', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onfocus handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-onblur="method": listener para blur events
      root.querySelectorAll('[data-onblur]').forEach(el => {
        if (!el.__eliteDirectiveOnblur) {
          el.__eliteDirectiveOnblur = true
          const methodName = el.dataset.onblur

          el.addEventListener('blur', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onblur handler error (${methodName}):`, err)
              }
            }
          })
        }
      })

      // data-onsubmit="method": listener para submit events (forms)
      root.querySelectorAll('[data-onsubmit]').forEach(el => {
        if (!el.__eliteDirectiveOnsubmit) {
          el.__eliteDirectiveOnsubmit = true
          const methodName = el.dataset.onsubmit

          el.addEventListener('submit', e => {
            if (typeof this[methodName] === 'function') {
              try {
                this[methodName](e)
              } catch (err) {
                console.error(`[SimpleComponent] onsubmit handler error (${methodName}):`, err)
              }
            }
          })
        }
      })
    } catch (e) {
      console.error('[SimpleComponent] directive processing error:', e)
    }
  }
}

window.SimpleComponent = SimpleComponent
= SimpleComponent
