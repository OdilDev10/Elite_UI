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
      handler: 'HomePage',
      container: '#app'
    },
    { 
      path: '/example', 
      handler: 'ExamplePage',
      container: '#app'
    }
  ],

  middleware: [
    // Ejemplo: logging
    // (path, state) => console.log('Navigating to:', path)
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
