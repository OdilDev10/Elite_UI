# Router

Hash-based routing with guards and middleware.

## Configuration

Create `pages/router.js`:

```javascript
export default {
    routes: [
        { path: '/', handler: 'HomePage' },
        { path: '/example', handler: 'ExamplePage' },
        { path: '/users/:id', handler: 'UserPage' }
    ],
    guards: [
        (to, from, state) => {
            if (requiresAuth(to.path) && !isLoggedIn()) {
                router.navigate('/login')
                return false
            }
            return true
        }
    ],
    middleware: [
        (path, state) => {
            $debug.log('Navigating to:', path)
        }
    ]
}
```

## Navigate

```javascript
router.navigate('/users/123')
router.navigate('/users/:id', { id: 456 })

router.back()
router.forward()
```

## Query Params

```javascript
// Get current query params
router.getQueryParams()  // { page: '1', sort: 'name' }

// Set query params (replaces all)
router.setQueryParams({ page: 2, sort: 'date' })

// Update specific param (merges)
router.updateQueryParam('page', 3)

// Remove param
router.removeQueryParam('sort')
```

## Subscribe to Changes

```javascript
const unsubscribe = router.subscribe((route) => {
    console.log('Current route:', route.path)
    console.log('Params:', route.params)
})

// Later: unsubscribe()
```

## Path Parameters

```javascript
// Route: /users/:id
router.navigate('/users/123')

// In handler:
router.getCurrentRoute().params.id  // '123'
```

## XSS Protection

All route paths and params are automatically sanitized before use.

## Features

- Hash-based routing (default) or HTML5 history
- Path parameters: `/users/:id`
- Query params: `/users?page=1`
- Navigation guards
- Middleware support
- XSS sanitization on all routes