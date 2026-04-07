/**
 * Router Configuration
 * Centralized route definitions with guards and layouts
 * 
 * Usage:
 * import { router } from './router/index.js'
 * 
 * router.addRoutes(routes)
 * router.navigate('/')
 */

import { router } from './router.js'

// Define route groups
const routes = [
    // Public routes
    {
        path: '/',
        component: 'HomePage',
        container: '#page-home',
        meta: { title: 'Home' }
    },
    {
        path: '/login',
        component: 'LoginPage',
        container: '#page-login',
        meta: { title: 'Login' },
        guards: ['isGuest']
    },
    {
        path: '/register',
        component: 'RegisterPage',
        container: '#page-register',
        meta: { title: 'Register' },
        guards: ['isGuest']
    },

    // Protected routes - require authentication
    {
        path: '/profile',
        component: 'ProfilePage',
        container: '#page-profile',
        meta: { title: 'Profile' },
        guards: ['isAuthenticated']
    },
    {
        path: '/settings',
        component: 'SettingsPage',
        container: '#page-settings',
        meta: { title: 'Settings' },
        guards: ['isAuthenticated']
    },

    // Admin routes - require admin role
    {
        path: '/admin',
        component: 'AdminPage',
        container: '#page-admin',
        meta: { title: 'Admin' },
        guards: ['isAuthenticated', 'isAdmin'],
        children: [
            {
                path: 'users',
                component: 'UsersPage',
                container: '#page-admin-users'
            },
            {
                path: 'settings',
                component: 'AdminSettingsPage',
                container: '#page-admin-settings'
            }
        ]
    }
]

// Add routes to router
router.addRoutes(routes)

// Set 404 handler
router.setNotFound(() => {
    console.log('[Router] Page not found')
    const container = document.querySelector('#page-404')
    if (container) {
        container.innerHTML = '<h1>404 - Page Not Found</h1>'
    }
})

// Global middleware example
router.use((path, params, meta) => {
    console.log(`[Router] Navigating to: ${path}`)
    // Update document title
    if (meta?.title) {
        document.title = `${meta.title} - MyApp`
    }
})

export { router }
