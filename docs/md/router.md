# EliteRouter - Sistema de Enrutamiento

## Overview

EliteRouter es el sistema de enrutamiento de EliteUI con soporte para guards, layouts, rutas anidadas y middleware.

## Uso Básico

```javascript
// Crear instancia
const router = new EliteRouter({
    useHash: true,      // Por defecto usa hash (#/path)
    layout: 'main'     // Layout por defecto
})

// Agregar rutas
router.addRoutes([
    { path: '/', component: 'HomePage' },
    { path: '/about', component: 'AboutPage' }
])

// Navegar
router.navigate('/')
```

---

## Configuración de Rutas

### Ruta Simple

```javascript
const routes = [
    {
        path: '/',
        component: 'HomePage',
        container: '#app',
        meta: { title: 'Home' }
    }
]
```

### Ruta con Parámetros

```javascript
{
    path: '/users/:id',
    component: 'UserPage',
    container: '#app'
}
```

### Ruta con Guards

```javascript
{
    path: '/admin',
    component: 'AdminPage',
    guards: ['isAuthenticated', 'isAdmin'],
    meta: { title: 'Admin Panel' }
}
```

### Ruta con Hijos (Nested Routes)

```javascript
{
    path: '/dashboard',
    component: 'DashboardLayout',
    layout: 'admin-layout',
    children: [
        { path: 'users', component: 'UsersPage' },
        { path: 'settings', component: 'SettingsPage' }
    ]
}
```

### Lazy Loading de Componentes

```javascript
{
    path: '/admin',
    component: 'AdminPage',
    lazy: { src: 'components/AdminPage.js' },
    guards: ['isAuthenticated', 'isAdmin']
}
```

El componente se carga solo cuando se navega a la ruta, reduciendo el bundle inicial.

---

## Guards (Protección de Rutas)

### Guards Incorporados

```javascript
{
    path: '/profile',
    guards: ['isAuthenticated']  // Requiere login
}

{
    path: '/admin',
    guards: ['isAdmin']  // Requiere rol admin
}

{
    path: '/login',
    guards: ['isGuest']  // Solo para NO logueados
}
```

### Guards Personalizados

```javascript
// Definir guard personalizado globalmente
window.myCustomGuard = function(to, from, params) {
    if (!hasAccess) {
        router.navigate('/access-denied')
        return false
    }
    return true
}

// Usar en ruta
{
    path: '/special',
    guards: ['myCustomGuard']
}
```

### Guards en Configuración Global

```javascript
router.beforeEach((to, from, state) => {
    console.log('Navigating to:', to)
    
    // Redirigir si es necesario
    if (requiresAuth(to) && !isLoggedIn()) {
        router.navigate('/login')
        return false
    }
    
    return true  // o retornar string para redirigir
})
```

---

## Layouts

### Registrar Layout

```javascript
// En EliteRouter
const router = new EliteRouter({
    layout: 'main-layout'
})

// O registrar dinámicamente
router.registerLayout('admin-layout', document.getElementById('admin-layout'))
```

### Usar Layout en Ruta

```javascript
{
    path: '/admin',
    component: 'AdminPage',
    layout: 'admin-layout'  // Override del layout por defecto
}
```

### Layout Principal (MainLayout.js)

```javascript
class MainLayout extends SimpleComponent {
    render() {
        this.el.innerHTML = `
            <header>...</header>
            <main id="app-content"></main>
            <footer>...</footer>
        `
    }
}
```

---

## Middleware

```javascript
// Middleware global
router.use((path, params, meta) => {
    console.log('Route:', path)
    
    // Actualizar título
    if (meta?.title) {
        document.title = `${meta.title} - MyApp`
    }
})
```

---

## Query Params

```javascript
// Obtener query params
router.getCurrentRoute().query  // { page: '1', sort: 'name' }

// Navegar con query params
router.navigate('/users?page=2')

// Actualizar query params
router.updateQueryParam('page', 3)

// Remover query param
router.removeQueryParam('sort')
```

---

## Composable Router

```javascript
// En router/index.js
import { router } from './router.js'

const routes = [
    { path: '/', component: 'HomePage' },
    { path: '/login', guards: ['isGuest'] },
    { path: '/admin', guards: ['isAuthenticated', 'isAdmin'] }
]

router.addRoutes(routes)

export { router }
```

---

## Eventos de Navegación

```javascript
// Suscribirse a cambios de ruta
router.subscribe((route) => {
    console.log('Path:', route.path)
    console.log('Params:', route.params)
    console.log('Meta:', route.meta)
})

// 404 handler
router.setNotFound(() => {
    document.getElementById('app').innerHTML = '<h1>404 - Not Found</h1>'
})
```

---

## Seguridad

### Protección XSS

```javascript
// Los parámetros de ruta se sanitizan automáticamente
// No se permiten protocols peligrosos
router.navigate('javascript:alert(1)')  // Bloqueado
router.navigate('data:text/html...')   // Bloqueado
```

### Validación de Rutas

- Solo se permiten paths seguros
- Parameters se escapan con textContent
- Limites en query params (max 50 params, max 2000 chars por valor)

---

## API Reference

| Método | Descripción |
|--------|-------------|
| `navigate(path)` | Navega a la ruta |
| `addRoute(route)` | Agrega una ruta |
| `addRoutes(routes)` | Agrega múltiples rutas |
| `subscribe(callback)` | Suscribe a cambios |
| `use(middleware)` | Agrega middleware |
| `beforeEach(guard)` | Agrega guard global |
| `setNotFound(handler)` | Handler para 404 |
| `getCurrentRoute()` | Obtiene ruta actual |
| `back()` | Navega atrás |
| `forward()` | Navega adelante |
| `getQueryParams()` | Obtiene query params |

---

## Ejemplo Completo

```javascript
// 1. Crear router
const router = new EliteRouter({
    useHash: true,
    layout: 'main'
})

// 2. Configurar middleware global
router.use((path, params, meta) => {
    document.title = meta?.title || 'MyApp'
})

// 3. Definir rutas
const routes = [
    {
        path: '/',
        component: 'HomePage',
        meta: { title: 'Home' }
    },
    {
        path: '/login',
        component: 'LoginPage',
        guards: ['isGuest'],
        meta: { title: 'Login' }
    },
    {
        path: '/profile',
        component: 'ProfilePage',
        guards: ['isAuthenticated'],
        meta: { title: 'Profile' }
    },
    {
        path: '/admin',
        component: 'AdminPage',
        guards: ['isAdmin'],
        meta: { title: 'Admin' }
    }
]

router.addRoutes(routes)

// 4. 404 handler
router.setNotFound(() => {
    console.log('Page not found')
})
```

---

**EliteRouter: Routing simple, potente y seguro. 🚀**
