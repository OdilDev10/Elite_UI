/**
 * Store Factory
 * Crea stores que se auto-registran con LazyLoader
 * 
 * Uso:
 * 
 * // Crear store
 * const cartStore = createStore('cartStore', {
 *   items: [],
 *   total: 0
 * })
 * 
 * // Usar en componente
 * class CartButton extends SimpleComponent {
 *   static dependencies = ['cartStore']
 *   
 *   constructor(selector, props) {
 *     super(selector, props)
 *     this.store = $lazy.get('cartStore')
 *   }
 * }
 */

function createStore(name, initialState = {}, options = {}) {
    const store = new SimpleStore(initialState, options)
    
    // Auto-registrar con LazyLoader
    if (window.LazyLoader) {
        LazyLoader.provide(name, store)
    }
    
    return store
}

/**
 * Registrar stores globales
 * Se llama desde stores/index.js
 */
function registerStores(registry) {
    for (const [name, config] of Object.entries(registry)) {
        if (config === false) continue
        
        const initialState = config.initialState || {}
        const options = config.options || {}
        
        const store = createStore(name, initialState, options)
        
        // Llamar init si existe
        if (config.init) {
            config.init(store)
        }
    }
}

// Exports
window.createStore = createStore
window.registerStores = registerStores
