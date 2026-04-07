/**
 * Bootstrap Application
 * Punto de entrada único para inicializar la aplicación
 *
 * Responsabilidades:
 * - Inicializar router
 * - Cargar componentes
 * - Configurar rutas
 * - Montar componentes principales
 * - Conectar navegación
 */

import { moduleLoader } from '../core/ModuleLoader.js'
import routeConfig from './router.js'

/**
 * Mapeo de rutas a IDs de tab
 * @private
 */
const ROUTE_TO_TAB = {
    '/': 'overview',
    '/components': 'components',
    '/http': 'http',
    '/schema': 'schema',
    '/validators': 'validators',
    '/debug': 'debug',
    '/router': 'router'
}

/**
 * Mapeo de IDs de tab a componentes
 * @private
 */
const TAB_ID_TO_COMPONENT = {
    'overview': 'OverviewTab',
    'components': 'ComponentsTab',
    'http': 'HttpTab',
    'schema': 'SchemaTab',
    'validators': 'ValidatorsTab',
    'debug': 'DebugTab',
    'router': 'RouterTab'
}

/**
 * Monta el componente de tab correspondiente
 * @param {string} tabId - ID del tab a montar
 * @private
 */
function mountTab(tabId) {
    const container = document.getElementById('tab-content')
    if (!container) return

    container.innerHTML = ''

    const componentName = TAB_ID_TO_COMPONENT[tabId]
    if (!componentName || !window[componentName]) return

    const TabComponent = window[componentName]
    const tabInstance = new TabComponent(container)
    tabInstance.mount()
}

/**
 * Callback ejecutado cuando la ruta cambia
 * @param {object} route - Objeto de ruta del router
 * @private
 */
function onRouteChange(route) {
    // Determinar qué tab mostrar basado en la ruta
    const tabId = ROUTE_TO_TAB[route.path] || 'overview'

    // Montar el componente del tab
    mountTab(tabId)

    // Actualizar el estado visual del TabNavigation
    updateActiveTab(tabId)
}

/**
 * Actualiza el estado visual del TabNavigation
 * @param {string} tabId - ID del tab activo
 * @private
 */
function updateActiveTab(tabId) {
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.classList.remove('active', 'border-accent', 'text-accent')
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active', 'border-accent', 'text-accent')
        }
    })
}

/**
 * Callback ejecutado cuando el usuario hace clic en un tab
 * @param {string} tabId - ID del tab seleccionado
 * @private
 */
function onTabChange(tabId) {
    // Mapear tab ID a ruta
    const routes = Object.entries(ROUTE_TO_TAB)
    const route = routes.find(([_, id]) => id === tabId)?.[0]

    if (route && window.router) {
        window.router.navigate(route)
    }
}

/**
 * Inicializa la aplicación
 * @async
 */
async function init() {
    try {
        // 1. Inicializar router
        moduleLoader.initRouter({ useHash: true })

        // 2. Cargar todos los componentes (CSS + JS)
        await moduleLoader.loadComponents()

        // 3. Configurar rutas y guards/middleware
        moduleLoader.loadRoutes(routeConfig)

        // 4. Montar ThemeToggle
        if (window.ThemeToggle) {
            const themeToggle = new ThemeToggle('#theme-toggle-container')
            themeToggle.mount()
        }

        // 5. Montar TabNavigation con callback
        if (window.TabNavigation) {
            const tabNav = new TabNavigation('#tabs-nav', {
                onTabChange: onTabChange
            })
            tabNav.mount()
        }

        // 6. Suscribirse a cambios de ruta
        if (window.router) {
            window.router.subscribe(onRouteChange)

            // Navegar a la ruta inicial (dispara onRouteChange automáticamente)
            window.router.navigate('/')
        }

        // Log de inicialización
        console.log('[EliteUI] Application initialized ✅')
        console.log('[EliteUI] Architecture: Clean separation of concerns')
        console.log('[EliteUI] Framework: SimpleComponent + SimpleStore + Router')
        console.log('[EliteUI] Styling: Tailwind CSS + main.css (CSS variables)')

    } catch (error) {
        console.error('[EliteUI] Bootstrap failed:', error)
    }
}

// Iniciar la aplicación
init()
