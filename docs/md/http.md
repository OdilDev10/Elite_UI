# $http

Simple HTTP client with interceptors.

## Basic Usage

```javascript
// GET
const data = await $http('/api/users')

// POST
const user = await $http('/api/users', { name: 'Juan' })

// PUT
await $http('/api/users/1', { name: 'Pedro' })

// DELETE
await $http('/api/users/1', { method: 'DELETE' })
```

## Custom Instance

```javascript
const api = $http.create({ baseUrl: '/api', timeout: 5000 })
await api('/users')
```

## Interceptors

### Request Interceptor

```javascript
$http.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    config.credentials = 'include'  // For cookies
    return config
})
```

### Response Interceptor

```javascript
$http.interceptors.response.use(
    (data) => data,  // Success handler
    (error) => {     // Error handler
        if (error.status === 401) {
            localStorage.removeItem('token')
            redirect('/login')
        }
        throw error
    }
)
```

## Options

```javascript
$http.create({
    baseUrl: '/api',      // Base URL for all requests
    timeout: 10000,       // Request timeout in ms (default: 10000)
    headers: {}           // Default headers
})
```