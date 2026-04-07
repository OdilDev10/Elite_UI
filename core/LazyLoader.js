/**
 * LazyLoader
 * 
 * Sistema de carga perezosa con resolución de dependencias.
 * Funciona con file:// protocolo (sin CORS).
 * 
 * Uso:
 * 
 * // Registrar módulo/dependencia
 * LazyLoader.provide('cartStore', cartStoreInstance)
 * LazyLoader.provide('userStore', userStoreInstance)
 * 
 * // Declarar dependencias en componente
 * class CartButton extends SimpleComponent {
 *   static dependencies = ['cartStore'] // se cargará antes
 * }
 * 
 * // Cargar componente lazily
 * await LazyLoader.loadComponent('CartButton', '#container')
 * 
 * // Cargar página con sus componentes
 * await LazyLoader.loadPage('HomePage', '#app')
 */

class LazyLoader {
    constructor() {
        this._providers = new Map()
        this._loaded = new Map()
        this._loading = new Map()
        this._callbacks = new Map()
    }

    /**
     * Registrar un módulo/dependencia global
     */
    provide(name, instance) {
        this._providers.set(name, instance)
        this._loaded.set(name, true)
        
        // Notificar a los等待者
        if (this._callbacks.has(name)) {
            this._callbacks.get(name).forEach(cb => cb(instance))
            this._callbacks.delete(name)
        }
    }

    /**
     * Obtener módulo/dependencia
     */
    get(name) {
        return this._providers.get(name)
    }

    /**
     * Verificar si está disponible
     */
    has(name) {
        return this._providers.has(name)
    }

    /**
     * Esperar a que un módulo esté disponible
     */
    when(name) {
        if (this._providers.has(name)) {
            return Promise.resolve(this._providers.get(name))
        }
        
        return new Promise(resolve => {
            if (!this._callbacks.has(name)) {
                this._callbacks.set(name, [])
            }
            this._callbacks.get(name).push(resolve)
        })
    }

    /**
     * Cargar script dinámicamente (sin ES modules para file://)
     */
    async _loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado
            const existing = document.querySelector(`script[src="${src}"]`)
            if (existing) {
                resolve()
                return
            }

            const script = document.createElement('script')
            script.src = src
            script.async = false // mantener orden
            script.onload = () => resolve()
            script.onerror = (e) => {
                console.warn(`[LazyLoader] Failed to load: ${src}`)
                resolve() // No fallar, permitir continuar
            }
            document.head.appendChild(script)
        })
    }

    /**
     * Cargar módulo y sus dependencias
     */
    async loadModule(name, basePath = 'modules') {
        if (this._loaded.has(name)) return this.get(name)
        if (this._loading.has(name)) {
            return this.when(name)
        }

        this._loading.set(name, true)

        const path = `${basePath}/${name}/${name}.js`
        
        try {
            await this._loadScript(path)
            
            // Después de cargar, obtener la instancia del provider
            const instance = this._providers.get(name)
            if (!instance) {
                console.warn(`[LazyLoader] Module ${name} loaded but no provider registered`)
            }
            
            this._loaded.set(name, true)
            this._loading.delete(name)
            
            return instance
        } catch (e) {
            this._loading.delete(name)
            throw e
        }
    }

    /**
     * Cargar store
     */
    async loadStore(name) {
        return this.loadModule(name, 'stores')
    }

    /**
     * Cargar componente con sus dependencias
     */
    async loadComponent(name, container, props = {}) {
        // 1. Cargar store dependencies si el componente las declara
        const ComponentClass = window[name]
        
        if (ComponentClass && ComponentClass.dependencies) {
            for (const dep of ComponentClass.dependencies) {
                if (!this.has(dep)) {
                    // Intentar cargar desde stores/
                    await this.loadStore(dep)
                }
            }
        }

        // 2. Cargar JS del componente si no está cargado
        if (!window[name]) {
            await this._loadScript(`components/${name}/${name}.js`)
        }

        // 3. Obtener la clase
        const Cls = window[name]
        if (!Cls) {
            throw new Error(`[LazyLoader] Component not found: ${name}`)
        }

        // 4. Crear instancia y montar
        const instance = new Cls(container, props)
        instance.mount()
        
        this._loaded.set(`component:${name}`, instance)
        return instance
    }

    /**
     * Cargar página con sus componentes
     */
    async loadPage(name, container, props = {}) {
        // 1. Cargar JS de la página
        if (!window[name]) {
            await this._loadScript(`pages/${name}/${name}.page.js`)
        }

        // 2. Obtener la clase
        const Cls = window[name]
        if (!Cls) {
            throw new Error(`[LazyLoader] Page not found: ${name}`)
        }

        // 3. Cargar dependencias de la página
        if (Cls.dependencies) {
            for (const dep of Cls.dependencies) {
                if (!this.has(dep)) {
                    await this.loadStore(dep)
                }
            }
        }

        // 4. Crear instancia y montar
        const instance = new Cls(container, props)
        instance.mount()
        
        this._loaded.set(`page:${name}`, instance)
        return instance
    }

    /**
     * Precargar módulo/componente sin instanciar
     */
    async preload(name, type = 'module', basePath = 'modules') {
        if (type === 'module') return this.loadModule(name, basePath)
        if (type === 'store') return this.loadStore(name)
        if (type === 'component') {
            if (!window[name]) {
                await this._loadScript(`components/${name}/${name}.js`)
            }
            return true
        }
        if (type === 'page') {
            if (!window[name]) {
                await this._loadScript(`pages/${name}/${name}.page.js`)
            }
            return true
        }
    }

    /**
     * Precargar varios módulos en paralelo
     */
    async preloadAll(items) {
        await Promise.all(items.map(({ name, type, path }) => 
            this.preload(name, type, path)
        ))
    }

    /**
     * Obtener instancia de componente/página ya cargada
     */
    getLoaded(name, type = 'component') {
        return this._loaded.get(`${type}:${name}`)
    }
}

// Instancia global
window.LazyLoader = new LazyLoader()
window.$lazy = window.LazyLoader // alias

console.log('[LazyLoader] Initialized')
