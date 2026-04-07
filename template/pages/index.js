/**
 * Pages Index
 * Exporta todas las páginas y configuración del router
 * 
 * Usage:
 * import { HomePage, router } from './index.js'
 */

// Registry for app.js loader
window.__elitePages = {
    HomePage: true
}

export { HomePage } from './home/home.js'

// Router configuration
const router = {
    routes: [
        {
            path: '/',
            handler: 'HomePage',
            container: '#app-root'
        }
    ],
    middleware: [],
    guards: []
}

export { router }
