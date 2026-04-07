/**
 * Router
 * Enrutamiento cliente con layouts, nested routes, guards y lazy loading
 * 
 * Usage:
 * const router = new EliteRouter({
 *   useHash: true,
 *   layout: 'default-layout',
 *   routes: [...]
 * })
 * 
 * Routes:
 * {
 *   path: '/admin',
 *   component: 'AdminPage',
 *   lazy: { src: 'components/AdminPage.js' },  // Lazy loading
 *   layout: 'admin-layout',
 *   guards: ['isAuthenticated'],
 *   meta: { title: 'Admin' },
 *   children: [
 *     { path: 'users', component: 'UsersPage' },
 *     { path: 'settings', component: 'SettingsPage' }
 *   ]
 * }
 */

class EliteRouter {
    constructor(options = {}) {
        this._routes = []
        this._routeMap = new Map()
        this._subscribers = []
        this._currentRoute = null
        this._currentLayout = null
        this._layoutEl = null
        
        this._useHash = options.useHash !== false
        this._basePath = options.basePath || ''
        this._defaultLayout = options.layout || null
        this._layouts = new Map()
        
        // Global guards
        this._guards = []
        this._middleware = []
        
        // LazyLoader for dynamic imports
        this._lazyLoader = new LazyLoader()
        
        // ErrorBoundary
        this._errorBoundary = new ErrorBoundary({
            ok: false,
            error: 'Component failed to load'
        })
        
        // 404 handler
        this._notFoundHandler = null
        
        // Current instance for cleanup
        this._currentInstance = null
        
        this._setup()
    }

    _setup() {
        window.addEventListener('hashchange', () => this._handleRouteChange())
        window.addEventListener('popstate', () => this._handleRouteChange())
        window.$router = this
        this._handleRouteChange()
    }

    /**
     * Register layout component
     */
    registerLayout(name, layoutEl) {
        this._layouts.set(name, layoutEl)
    }

    /**
     * Add route
     */
    addRoute(route) {
        this._routes.push(route)
        this._buildRouteMap()
        return this
    }

    /**
     * Add multiple routes
     */
    addRoutes(routes) {
        this._routes.push(...routes)
        this._buildRouteMap()
        return this
    }

    /**
     * Build route map for fast lookup
     */
    _buildRouteMap() {
        this._routeMap.clear()
        
        const addToMap = (route, parent = null) => {
            const fullPath = parent 
                ? `${parent.path}${route.path}` 
                : route.path
            
            this._routeMap.set(fullPath, {
                ...route,
                fullPath,
                parent
            })
            
            // Add children
            if (route.children) {
                route.children.forEach(child => addToMap(child, route))
            }
        }
        
        this._routes.forEach(route => addToMap(route))
    }

    /**
     * Set 404 handler
     */
    setNotFound(handler) {
        this._notFoundHandler = handler
    }

    /**
     * Navigate to path
     */
    async navigate(path, state = {}) {
        if (!this._isSafePath(path)) {
            console.warn('[Router] blocked unsafe path:', path)
            return false
        }

        // Run global guards
        for (const guard of this._guards) {
            const result = await guard(path, this._currentRoute?.fullPath, state)
            if (result === false) return false
            if (result !== true && typeof result === 'string') {
                path = result // Allow guard to redirect
            }
        }

        if (this._useHash) {
            window.location.hash = path
        } else {
            window.history.pushState(state, '', path)
            this._handleRouteChange()
        }
        return true
    }

    /**
     * Check if path is safe
     */
    _isSafePath(path) {
        if (!path || typeof path !== 'string') return false
        const dangerous = ['javascript:', 'data:', 'vbscript:', 'file:']
        return !dangerous.some(p => path.toLowerCase().includes(p))
    }

    /**
     * Get current path
     */
    _getCurrentPath() {
        if (this._useHash) {
            const hash = window.location.hash.slice(1)
            return hash.startsWith('/') ? hash : '/' + hash
        }
        return window.location.pathname
    }

    /**
     * Handle route change
     */
    async _handleRouteChange() {
        const path = this._getCurrentPath()
        const routeInfo = this._matchRoute(path)
        
        if (!routeInfo) {
            this._currentRoute = { path, notFound: true }
            this._notify(this._currentRoute)
            this._notFoundHandler?.()
            return
        }

        const { route, params, parentRoute } = routeInfo

        // Run route-specific guards
        if (route.guards) {
            for (const guardName of route.guards) {
                const guardFn = this._getGuard(guardName)
                if (guardFn) {
                    const result = await guardFn(path, this._currentRoute?.fullPath, params)
                    if (result === false) {
                        console.log(`[Router] route guard "${guardName}" blocked`)
                        return
                    }
                }
            }
        }

        // Run middleware
        for (const mw of this._middleware) {
            await mw(path, params, route.meta)
        }

        // Update layout
        const layoutName = route.layout || parentRoute?.layout || this._defaultLayout
        await this._updateLayout(layoutName)

        // Update route
        this._currentRoute = {
            ...route,
            params,
            query: this._getQueryParams()
        }

        // Mount component if exists
        if (route.component) {
            await this._mountComponent(route)
        }

        // Notify subscribers
        this._notify(this._currentRoute)
    }

    /**
     * Get guard function by name
     */
    _getGuard(name) {
        // Built-in guards
        if (name === 'isAuthenticated') {
            return () => {
                if (!$permissions?.getCurrentUser()) {
                    this.navigate('/login')
                    return false
                }
                return true
            }
        }
        if (name === 'isGuest') {
            return () => {
                if ($permissions?.getCurrentUser()) {
                    this.navigate('/')
                    return false
                }
                return true
            }
        }
        if (name === 'isAdmin') {
            return () => {
                if (!$permissions?.isRole('admin')) {
                    this.navigate('/')
                    return false
                }
                return true
            }
        }
        
        // Custom guard from window
        if (typeof window[name] === 'function') {
            return window[name]
        }
        
        return null
    }

    /**
     * Mount component to container
     */
    async _mountComponent(route) {
        const container = route.container || '#app'
        const el = document.querySelector(container)
        if (!el) {
            console.warn(`[Router] container not found: ${container}`)
            return
        }

        let ComponentClass = window[route.component]
        
        // Lazy loading
        if (!ComponentClass && route.lazy) {
            const src = route.lazy.src || `components/${route.component}.js`
            try {
                await this._lazyLoader.loadScript(src, route.component)
                ComponentClass = window[route.component]
            } catch (e) {
                console.error(`[Router] failed to lazy load ${route.component}:`, e)
                this._errorBoundary._handleError(e, `lazy:${route.component}`)
                return
            }
        }

        if (!ComponentClass) {
            console.warn(`[Router] component not found: ${route.component}`)
            return
        }

        // Pass params and query
        const props = { 
            ...route.params,
            ...(route.props || {}),
            query: this._getQueryParams()
        }

        // Cleanup previous instance
        if (this._currentInstance) {
            this._currentInstance.unmount?.()
        }

        // Mount with ErrorBoundary
        try {
            const instance = new ComponentClass(container, props)
            instance.mount()
            this._currentInstance = instance
        } catch (e) {
            console.error(`[Router] error mounting ${route.component}:`, e)
            this._errorBoundary._handleError(e, `mount:${route.component}`)
            // Show fallback
            el.innerHTML = `<div class="text-red-500 p-4">Error loading component: ${route.component}</div>`
        }
    }

    /**
     * Update layout
     */
    async _updateLayout(layoutName) {
        if (this._currentLayout === layoutName) return
        
        if (!layoutName) {
            this._layoutEl = null
            this._currentLayout = null
            return
        }

        const layoutEl = this._layouts.get(layoutName)
        if (!layoutEl) {
            // Try to find element with id
            const el = document.querySelector(`#${layoutName}`)
            if (el) {
                this._layoutEl = el
                this._currentLayout = layoutName
            }
            return
        }

        this._layoutEl = layoutEl
        this._currentLayout = layoutName
    }

    /**
     * Match route to path
     */
    _matchRoute(path) {
        // Clean path
        path = path.split('?')[0]
        
        // Check exact match first
        const exact = this._routeMap.get(path)
        if (exact) return { route: exact, params: {}, parentRoute: exact.parent }

        // Check with trailing slash
        if (path.endsWith('/') && path !== '/') {
            const withoutSlash = path.slice(0, -1)
            const match = this._routeMap.get(withoutSlash)
            if (match) return { route: match, params: {}, parentRoute: match.parent }
        }

        // Check dynamic routes
        for (const [routePath, routeInfo] of this._routeMap) {
            const params = this._matchDynamicRoute(routePath, path)
            if (params) {
                return { 
                    route: routeInfo, 
                    params, 
                    parentRoute: routeInfo.parent 
                }
            }
        }

        return null
    }

    /**
     * Match dynamic route
     */
    _matchDynamicRoute(pattern, path) {
        const patternParts = pattern.split('/').filter(Boolean)
        const pathParts = path.split('/').filter(Boolean)

        if (patternParts.length !== pathParts.length) return null

        const params = {}
        for (let i = 0; i < patternParts.length; i++) {
            const p = patternParts[i]
            const a = pathParts[i]

            if (p.startsWith(':')) {
                params[p.slice(1)] = this._sanitizeParam(a)
            } else if (p !== a) {
                return null
            }
        }

        return params
    }

    /**
     * Sanitize route param
     */
    _sanitizeParam(value) {
        try {
            const el = document.createElement('div')
            el.textContent = decodeURIComponent(value)
            return el.innerHTML
        } catch {
            return value
        }
    }

    /**
     * Get query params
     */
    _getQueryParams() {
        const search = this._useHash
            ? window.location.hash.split('?')[1] || ''
            : window.location.search.slice(1)
        
        if (!search) return {}
        
        const params = {}
        search.split('&').slice(0, 50).forEach(pair => {
            const [key, value = ''] = pair.split('=')
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value.slice(0, 2000))
            }
        })
        return params
    }

    /**
     * Subscribe to route changes
     */
    subscribe(callback) {
        this._subscribers.push(callback)
        return () => {
            this._subscribers = this._subscribers.filter(cb => cb !== callback)
        }
    }

    _notify(route) {
        this._subscribers.forEach(cb => cb(route))
    }

    /**
     * Add global guard
     */
    beforeEach(guard) {
        this._guards.push(guard)
        return () => {
            this._guards = this._guards.filter(g => g !== guard)
        }
    }

    /**
     * Add middleware
     */
    use(middleware) {
        this._middleware.push(middleware)
        return () => {
            this._middleware = this._middleware.filter(m => m !== middleware)
        }
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this._currentRoute
    }

    /**
     * Back
     */
    back() {
        window.history.back()
    }

    /**
     * Forward
     */
    forward() {
        window.history.forward()
    }
}

window.EliteRouter = EliteRouter
