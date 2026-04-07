/**
 * Framework Core
 * Exonoor Miniframework - Vanilla JS sin dependencias
 *
 * Incluye:
 * - SimpleComponent: Base reactiva para componentes
 * - SimpleStore: State management global
 * - Context: Compartir estado entre componentes
 * - ErrorBoundary: Captura y manejo de errores
 * - Router: Enrutamiento cliente con query params
 * - LazyLoader: Carga dinámica de recursos
 * - HttpClient: Wrapper de fetch con interceptors
 * - useForm: State management de formularios con validación
 * - DevTools: Debugging utilities para desarrollo
 * - DomUtils: Sanitización, masks, view transitions
 *
 * Cargar después de este archivo:
 * <script src="js/framework/core/SimpleComponent.js"></script>
 * <script src="js/framework/core/SimpleStore.js"></script>
 * <script src="js/framework/core/Context.js"></script>
 * <script src="js/framework/core/ErrorBoundary.js"></script>
 * <script src="js/framework/core/Router.js"></script>
 * <script src="js/framework/core/LazyLoader.js"></script>
 * <script src="js/framework/core/HttpClient.js"></script>
 * <script src="js/framework/core/Validators.js"></script>
 * <script src="js/framework/core/useForm.js"></script>
 * <script src="js/framework/core/DomUtils.js"></script>
 * <script src="js/framework/core/DevTools.js"></script>
 * <script src="js/framework/core/index.js"></script>
 *
 * CSS:
 * <link rel="stylesheet" href="css/utilities.css">
 */

// Global framework object
const EliteUI = {
    version: '1.0.0',
    components: new Map(),
    stores: new Map(),
    contexts: new Map(),

    // Registrar componente
    registerComponent(name, ComponentClass) {
        this.components.set(name, ComponentClass)
        return ComponentClass
    },

    // Get componente
    getComponent(name) {
        return this.components.get(name)
    },

    // Registrar store global
    registerStore(name, store) {
        this.stores.set(name, store)
        return store
    },

    // Get store
    getStore(name) {
        return this.stores.get(name)
    },

    // Registrar contexto
    registerContext(name, context) {
        this.contexts.set(name, context)
        return context
    },

    // Get contexto
    getContext(name) {
        return this.contexts.get(name)
    },

    // Debug
    debug() {
        console.group('[EliteUI]')
        console.log('Version:', this.version)
        console.log('Components:', this.components.size)
        console.log('Stores:', this.stores.size)
        console.log('Contexts:', this.contexts.size)
        console.groupEnd()
    },

    // Create app instance
    createApp(options = {}) {
        return new App(options)
    },
}

// App class para bootstrapping
class App {
    constructor(options = {}) {
        this.name = options.name || 'Exonoor App'
        this.rootSelector = options.root || '#app'
        this.rootEl = document.querySelector(this.rootSelector)

        this.store = options.store || null
        this.router = options.router || null
        this.errorBoundary = options.errorBoundary || new ErrorBoundary()

        this.components = new Map()
        this._mounted = false
    }

    // Mount app
    mount() {
        if (this._mounted) return
        if (!this.rootEl) {
            console.error(`[App] root element not found: ${this.rootSelector}`)
            return
        }

        try {
            console.log(`[App] Mounting ${this.name}`)

            // Router init
            if (this.router) {
                this.router.subscribe((route) => {
                    this.onRouteChange?.(route)
                })
            }

            this._mounted = true
            this.onMounted?.()
        } catch (e) {
            this.errorBoundary._handleError(e, 'app.mount')
        }
    }

    // Register component instance
    registerComponent(name, instance) {
        this.components.set(name, instance)
        instance.mount?.()
        return instance
    }

    // Unmount app
    unmount() {
        if (!this._mounted) return

        // Unmount all components
        for (const component of this.components.values()) {
            component.unmount?.()
        }

        this.components.clear()
        this._mounted = false
        this.onUnmounted?.()
    }

    // Navigate
    navigate(path, state = {}) {
        if (!this.router) {
            console.warn('[App] router not configured')
            return
        }
        return this.router.navigate(path, state)
    }

    // Get state
    getState(path) {
        if (!this.store) {
            console.warn('[App] store not configured')
            return null
        }
        return path ? this.store.getValue(path) : this.store.getState()
    }

    // Set state
    setState(updates) {
        if (!this.store) {
            console.warn('[App] store not configured')
            return
        }
        this.store.setState(updates)
    }

    // Debug
    debug() {
        console.group(`[App] ${this.name}`)
        console.log('Mounted:', this._mounted)
        console.log('Components:', this.components.size)
        console.log('Has store:', !!this.store)
        console.log('Has router:', !!this.router)
        console.log('ErrorBoundary errors:', this.errorBoundary.getErrors().length)
        console.groupEnd()
    }
}

// Export global
window.EliteUI = EliteUI
window.App = App

// Create default HTTP client (optional)
window.http = new HttpClient({ baseUrl: '/api' })

console.log('[EliteUI] v1.0.0 loaded')
console.log('Core classes:')
console.log('  - SimpleComponent (reactive components)')
console.log('  - SimpleStore (global state management)')
console.log('  - Context (prop drilling prevention)')
console.log('  - ErrorBoundary (error handling)')
console.log('  - Router (client-side routing + query params)')
console.log('  - LazyLoader (dynamic resource loading)')
console.log('  - HttpClient (fetch wrapper with interceptors)')
console.log('  - UseForm (form state + security features)')
console.log('  - EliteUI (registry)')
console.log('  - App (application bootstrap)')
console.log('  - DevTools (debugging utilities)')
console.log('')
console.log('Security & Validation:')
console.log('  - Validators.email(value)')
console.log('  - Validators.password(value, { min: 8 })')
console.log('  - Validators.creditCard(value)')
console.log('  - Validators.phone(value)')
console.log('  - Validators.noXSS(value)')
console.log('  - Validators.noSQLi(value)')
console.log('  - combineValidators(...validators)')
console.log('')
console.log('DOM Utilities:')
console.log('  - sanitize(html) - Prevent XSS')
console.log('  - createMask(pattern) - Input formatting')
console.log('  - Masks.phone, Masks.creditCard, Masks.date, etc')
console.log('  - withViewTransition(callback) - Smooth DOM animations')
console.log('  - debounce(func, delay) - Debounce')
console.log('  - throttle(func, limit) - Throttle')
console.log('')
console.log('Form (with security):')
console.log('  - form = component.useForm(schema, { csrfToken, rateLimitMs })')
console.log('  - form.bind(name, selector, { mask, sanitize })')
console.log('  - form.getPasswordStrengthLabel(fieldName)')
console.log('  - form.setCsrfToken(token)')
console.log('  - form.validateField(name) - Security checks included')
console.log('')
console.log('Router (with query params):')
console.log('  - router.getQueryParams()')
console.log('  - router.setQueryParams({ page: 2 })')
console.log('  - router.updateQueryParam(key, value)')
console.log('')
console.log('CSS Utilities:')
console.log('  - Load: <link rel="stylesheet" href="css/utilities.css">')
console.log('  - Classes: .flex, .gap-2, .p-4, .rounded, .text-error, etc')
console.log('')
console.log('DevTools: $exonoor.devtools.help()')
