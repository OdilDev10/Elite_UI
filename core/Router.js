/**
 * Router
 * Enrutamiento cliente (complementa el router existente si quieres)
 *
 * Uso:
 * const router = new Router()
 * router.on('/users/:id', (params) => { ... })
 * router.navigate('/users/1')
 */

class Router {
  constructor(options = {}) {
    this._routes = new Map()
    this._paramRoutes = []
    this._subscribers = []
    this._currentRoute = null
    this._basePath = options.basePath || ''
    this._hash = options.useHash !== false

    this._middleware = []
    this._guards = []
    this._history = []
    this._maxHistory = 50

    this._setup()
  }

  _setup() {
    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      this._handleRouteChange()
    })

    // Listen to popstate
    window.addEventListener('popstate', () => {
      this._handleRouteChange()
    })

    // Register as global singleton para data-link directives
    window.$router = this

    // Initial route
    this._handleRouteChange()
  }

  /**
   * Register route
   * @param {string} path - '/users' o '/users/:id' o '/users/:id/posts/:postId'
   * @param {Function|Object} handler
   */
  on(path, handler) {
    // Check if dynamic
    if (path.includes(':')) {
      const pattern = this._pathToRegex(path)
      this._paramRoutes.push({ pattern, path, handler, keys: this._extractKeys(path) })
    } else {
      this._routes.set(path, handler)
    }
    return this
  }

  /**
   * Extract param keys from path
   */
  _extractKeys(path) {
    const regex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g
    const keys = []
    let match

    while ((match = regex.exec(path)) !== null) {
      keys.push(match[1])
    }

    return keys
  }

  /**
   * Sanitize route parameter to prevent XSS
   */
  _sanitizeRouteParam(value) {
    if (!value) return ''
    try {
      // Decode URI first, then sanitize
      const decoded = decodeURIComponent(value)
      // Use DOM API to escape HTML
      const el = document.createElement('div')
      el.textContent = decoded
      return el.innerHTML
    } catch (e) {
      // If decoding fails, return the original value escaped
      const el = document.createElement('div')
      el.textContent = value
      return el.innerHTML
    }
  }

  /**
   * Check if path is safe to navigate to (no javascript: etc)
   */
  _isSafePath(path) {
    if (!path || typeof path !== 'string') return false
    const lower = path.trim().toLowerCase()
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
    return !dangerousProtocols.some(p => lower.startsWith(p))
  }

  /**
   * Convert path pattern to regex
   */
  _pathToRegex(path) {
    const escaped = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    const withParams = escaped.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^/]+)')
    return new RegExp(`^${withParams}$`)
  }

  /**
   * Parse params from URL
   */
  _parseParams(path) {
    const currentPath = this._getCurrentPath()

    // Exact match
    if (this._routes.has(path)) {
      return {}
    }

    // Dynamic match
    for (const route of this._paramRoutes) {
      const match = currentPath.match(route.pattern)
      if (match) {
        const params = {}
        route.keys.forEach((key, i) => {
          // Sanitize route params to prevent XSS
          params[key] = this._sanitizeRouteParam(match[i + 1])
        })
        return params
      }
    }

    return null
  }

  /**
   * Get current path from URL/hash
   */
  _getCurrentPath() {
    if (this._hash) {
      const hash = window.location.hash.slice(1)
      return hash.startsWith('/') ? hash : '/' + hash
    } else {
      return window.location.pathname
    }
  }

  /**
   * Navigate
   * @param {string} path
   * @param {Object} state
   */
  async navigate(path, state = {}) {
    // Security: block dangerous protocols
    if (!this._isSafePath(path)) {
      console.warn('[Router] blocked navigation to unsafe path:', path)
      return false
    }

    // Guards
    for (const guard of this._guards) {
      const canNavigate = await guard(path, this._currentRoute?.path, state)
      if (!canNavigate) {
        console.log('[Router] navigation blocked by guard')
        return false
      }
    }

    // Middleware
    for (const mw of this._middleware) {
      await mw(path, state)
    }

    // Update URL
    if (this._hash) {
      window.location.hash = path
    } else {
      window.history.pushState(state, '', path)
      this._handleRouteChange()
    }

    return true
  }

  /**
   * Handle route change
   */
  _handleRouteChange() {
    const path = this._getCurrentPath()

    // Check if already on this route
    if (this._currentRoute?.path === path) return

    // Find handler
    let handler = this._routes.get(path)
    let params = {}
    let matched = false

    if (handler) {
      matched = true
    } else {
      // Try dynamic routes
      for (const route of this._paramRoutes) {
        const match = path.match(route.pattern)
        if (match) {
          handler = route.handler
          matched = true
          route.keys.forEach((key, i) => {
            params[key] = match[i + 1]
          })
          break
        }
      }
    }

    if (!matched) {
      // 404
      this._currentRoute = { path, notFound: true }
      this._notify({ path, notFound: true })
      return
    }

    // Call handler
    this._currentRoute = { path, params, handler }

    try {
      if (typeof handler === 'function') {
        handler(params)
      } else if (handler && typeof handler.load === 'function') {
        // Component-like handler
        handler.load(params)
      }
    } catch (e) {
      console.error('[Router] handler error:', e)
    }

    // Add to history
    this._history.push({
      timestamp: Date.now(),
      path,
      params
    })
    if (this._history.length > this._maxHistory) {
      this._history.shift()
    }

    // Notify
    this._notify(this._currentRoute)
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
    this._subscribers.forEach(cb => {
      try {
        cb(route)
      } catch (e) {
        console.error('[Router] subscriber error:', e)
      }
    })
  }

  /**
   * Add navigation guard
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
   * Get history
   */
  getHistory() {
    return [...this._history]
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

  /**
   * Get query params from current URL
   * /users?page=1&sort=name → { page: '1', sort: 'name' }
   * Security: limits params to prevent DoS
   */
  getQueryParams() {
    const searchStr = this._hash
      ? window.location.hash.split('?')[1] || ''
      : window.location.search.slice(1)

    if (!searchStr) return {}

    const params = {}
    const pairs = searchStr.split('&')
    const MAX_PARAMS = 50
    const MAX_KEY_LENGTH = 100
    const MAX_VALUE_LENGTH = 2000

    for (let i = 0; i < pairs.length && i < MAX_PARAMS; i++) {
      const pair = pairs[i]
      const [key, value] = pair.split('=')
      if (key && key.length <= MAX_KEY_LENGTH) {
        const decodedKey = decodeURIComponent(key)
        const decodedValue = value ? decodeURIComponent(value) : ''
        // Limit value length
        params[decodedKey] = decodedValue.slice(0, MAX_VALUE_LENGTH)
      }
    }

    return params
  }

  /**
   * Set query params (replaces existing)
   * router.setQueryParams({ page: 2, sort: 'date' })
   */
  setQueryParams(queryParams) {
    const path = this._getCurrentPath()
    const queryStr = this._buildQueryString(queryParams)
    const newUrl = queryStr ? `${path}?${queryStr}` : path

    if (this._hash) {
      window.location.hash = newUrl
    } else {
      window.history.pushState({}, '', newUrl)
      this._handleRouteChange()
    }
  }

  /**
   * Update specific query param (merges with existing)
   * router.updateQueryParam('page', 2)
   * router.updateQueryParam({ page: 2, sort: 'date' })
   */
  updateQueryParam(keyOrObj, value = null) {
    const current = this.getQueryParams()
    let updates = {}

    if (typeof keyOrObj === 'string') {
      updates[keyOrObj] = value
    } else {
      updates = keyOrObj
    }

    const merged = { ...current, ...updates }
    this.setQueryParams(merged)
  }

  /**
   * Remove query param
   * router.removeQueryParam('page')
   */
  removeQueryParam(key) {
    const current = this.getQueryParams()
    delete current[key]
    this.setQueryParams(current)
  }

  /**
   * Build query string from object
   */
  _buildQueryString(params) {
    const pairs = []
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      }
    }
    return pairs.join('&')
  }

  /**
   * Debug
   */
  debug() {
    console.group('[Router]')
    console.log('Current route:', this._currentRoute)
    console.log('Query params:', this.getQueryParams())
    console.log('Routes:', this._routes.size)
    console.log('Dynamic routes:', this._paramRoutes.length)
    console.log('History:', this._history.length)
    console.groupEnd()
  }
}

window.Router = Router
