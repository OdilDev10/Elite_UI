/**
 * ModuleLoader
 * Carga automática de componentes y configuración del router
 * 
 * Uso:
 * 
 * // Cargar componentes globalmente
 * const loader = new ModuleLoader()
 * await loader.loadComponents()
 * 
 * // Configurar router
 * loader.loadRoutes(routesConfig)
 */

class ModuleLoader {
  constructor() {
    this._components = new Map()
    this._loaded = false
    this._loading = false
    this._readyCallbacks = []
  }

  /**
   * Cargar todos los componentes registrados en components/index.js
   */
  async loadComponents() {
    if (this._loaded) return
    if (this._loading) return

    this._loading = true

    try {
      // Intentar cargar el registro de componentes
      const registry = await this._loadRegistry()
      
      if (!registry) {
        console.warn('[ModuleLoader] components/index.js not found')
        return
      }

      // Cargar cada componente del registry
      const entries = Object.entries(registry)
      
      for (const [name, config] of entries) {
        if (config === false || config === null) continue // Saltar componentes deshabilitados
        
        const componentConfig = typeof config === 'object' ? config : {}
        await this.loadComponent(name, componentConfig)
      }

      this._loaded = true
      this._notifyReady()

    } catch (e) {
      console.error('[ModuleLoader] failed to load components:', e)
    } finally {
      this._loading = false
    }
  }

  /**
   * Cargar un componente individual
   */
  async loadComponent(name, config = {}) {
    const base = `components/${name}`

    // Cargar CSS si existe (skip since we're using Tailwind)
    // await this._loadCSS(`${base}/${name}.css`)

    // Cargar JS
    await this._loadScript(`${base}/${name}.js`)

    // Obtener la clase del componente del registry global
    const ComponentClass = window[name]
    
    if (ComponentClass) {
      this._components.set(name, { 
        class: ComponentClass,
        config,
        loaded: true 
      })
      
      // Registrar en EliteUI
      if (window.EliteUI) {
        EliteUI.registerComponent(name, ComponentClass)
      }

      console.log(`[ModuleLoader] Loaded: ${name}`)
    } else {
      console.warn(`[ModuleLoader] Component class not found: ${name}`)
    }

    return ComponentClass
  }

  /**
   * Obtener un componente por nombre
   */
  getComponent(name) {
    return this._components.get(name)
  }

  /**
   * Obtener todos los componentes cargados
   */
  getAllComponents() {
    return Object.fromEntries(this._components)
  }

  /**
   * Verificar si un componente está cargado
   */
  hasComponent(name) {
    return this._components.has(name)
  }

  /**
   * Esperar a que todos los componentes estén cargados
   */
  whenReady(callback) {
    if (this._loaded) {
      callback()
    } else {
      this._readyCallbacks.push(callback)
    }
  }

  /**
   * Cargar registro de componentes
   */
  async _loadRegistry() {
    // Primero verificar si ya está cargado globalmente
    if (window.__eliteComponents) {
      return window.__eliteComponents
    }

    // Cargar el script si no existe
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'components/index.js'
      script.onload = () => resolve(window.__eliteComponents || {})
      script.onerror = () => {
        console.warn('[ModuleLoader] Could not load components/index.js')
        resolve({})
      }
      document.head.appendChild(script)
    })
  }

  /**
   * Cargar CSS dinámicamente
   */
  async _loadCSS(href) {
    // Verificar si ya está cargado
    const existing = document.querySelector(`link[href="${href}"]`)
    if (existing) return

    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.onload = () => resolve()
      link.onerror = () => {
        console.warn(`[ModuleLoader] CSS not found: ${href}`)
        resolve() // No fallar por CSS faltante
      }
      document.head.appendChild(link)
    })
  }

  /**
   * Cargar JS dinámicamente
   */
  async _loadScript(src) {
    // Verificar si ya está cargado
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) return

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => {
        console.warn(`[ModuleLoader] JS not found: ${src}`)
        resolve() // No fallar por JS faltante
      }
      document.head.appendChild(script)
    })
  }

  /**
   * Notificar que está listo
   */
  _notifyReady() {
    this._readyCallbacks.forEach(cb => {
      try {
        cb()
      } catch (e) {
        console.error('[ModuleLoader] ready callback error:', e)
      }
    })
    this._readyCallbacks = []

    // Dispatch event global
    window.dispatchEvent(new CustomEvent('EliteUI:ready'))
  }

  /**
   * Configurar rutas del router
   * @param {Object} routesConfig - Configuración de rutas
   */
  loadRoutes(routesConfig) {
    if (!window.router) {
      console.warn('[ModuleLoader] Router not initialized')
      return
    }

    const { routes, middleware = [], guards = [] } = routesConfig

    // Agregar guards
    guards.forEach(guard => router.beforeEach(guard))

    // Agregar middleware
    middleware.forEach(mw => router.use(mw))

    // Registrar rutas
    routes.forEach(route => {
      const { path, handler, ...options } = route
      
      // Sanitizar path
      const sanitizedPath = this._sanitizePath(path)
      
      if (typeof handler === 'function') {
        router.on(sanitizedPath, handler)
      } else if (typeof handler === 'string') {
        // Handler es nombre de página/componente
        router.on(sanitizedPath, (params) => {
          this._loadPageHandler(handler, params, options)
        })
      }
    })

    console.log(`[ModuleLoader] Loaded ${routes.length} routes`)
  }

  /**
   * Sanitizar path para prevenir XSS
   */
  _sanitizePath(path) {
    if (!path || typeof path !== 'string') return '/'
    
    // Solo permitir alphanumeric, /, -, :, _
    const sanitized = path.replace(/[^a-zA-Z0-9/\-:._~-]/g, '')
    
    // Prevenir path traversal
    if (sanitized.includes('..')) return '/'
    
    return sanitized
  }

  /**
   * Cargar handler de página
   */
  async _loadPageHandler(pageName, params, options) {
    const { container = '#app', css = true } = options

    // Cargar JS de la página si existe
    const pageJS = `pages/${pageName}/${pageName}.page.js`
    await this._loadScript(pageJS)

    // Obtener el componente de la página
    const PageComponent = window[pageName + 'Page']
    
    if (PageComponent) {
      const pageInstance = new PageComponent(container, { params })
      pageInstance.mount()
    }
  }

  /**
   * Inicializar router
   */
  initRouter(options = {}) {
    if (window.router) return window.router

    window.router = new Router({
      basePath: options.basePath || '',
      useHash: options.useHash !== false
    })

    return window.router
  }
}

// Instancia global
window.ModuleLoader = ModuleLoader
window.moduleLoader = new ModuleLoader()

console.log('[ModuleLoader] Initialized')
