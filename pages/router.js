/**
 * Router Configuration
 * Definición centralizada de rutas
 * 
 * Estructura:
 * {
 *   routes: [
 *     { path: '/ruta', handler: 'PageName' },
 *     { path: '/ruta/:param', handler: (params) => {} }
 *   ],
 *   middleware: [
 *     (path, state) => { /* lógica */ }
 *   ],
 *   guards: [
 *     (to, from, state) => true/false
 *   ]
 * }
 */

export default {
  routes: [
    {
      path: '/',
      tab: 'overview',
      container: '#tab-content'
    },
    {
      path: '/components',
      tab: 'components',
      container: '#tab-content'
    },
    {
      path: '/http',
      tab: 'http',
      container: '#tab-content'
    },
    {
      path: '/schema',
      tab: 'schema',
      container: '#tab-content'
    },
    {
      path: '/validators',
      tab: 'validators',
      container: '#tab-content'
    },
    {
      path: '/debug',
      tab: 'debug',
      container: '#tab-content'
    },
    {
      path: '/router',
      tab: 'router',
      container: '#tab-content'
    },
    {
      path: '/example',
      handler: 'ExamplePage',
      container: '#app'
    }
  ],

  middleware: [
    // Log navigation
    (path, state) => {
      $debug?.log?.('Navigation', { path })
    }
  ],

  guards: [
    // Ejemplo: autenticación
    // (to, from, state) => {
    //   if (to.path.startsWith('/admin') && !isAuthenticated()) {
    //     router.navigate('/login')
    //     return false
    //   }
    //   return true
    // }
  ]
}
