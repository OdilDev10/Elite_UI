# HTTP Clients - $http y HttpClient

EliteUI ofrece dos clientes HTTP:

1. **`$http`** - Simple, minimalista
2. **`HttpClient`** - Con interceptores, para casos complejos

---

## $http - Cliente Simple

### Uso Básico

```javascript
// GET
const data = await $http('/users')

// POST
const user = await $http('/users', { name: 'Juan' })

// PUT
await $http('/users/1', { name: 'Pedro' })

// DELETE
await $http('/users/1', { method: 'DELETE' })
```

### Opciones

```javascript
// GET con query params
$http('/users', { page: 1, limit: 10 })

// POST con headers custom
$http('/users', {
    method: 'POST',
    body: { name: 'Juan' },
    headers: { 'X-Custom': 'value' }
})
```

### Crear Instancia Personalizada

```javascript
const api = $http.create({ baseUrl: '/api', timeout: 5000 })
await api('/users')  // GET /api/users
```

---

## HttpClient - Cliente con Interceptores

Para uso avanzado con interceptores de request/response.

### Uso

```javascript
const http = new HttpClient({
    baseUrl: '/api',
    timeout: 30000
})

// GET
const res = await http.get('/users')

// POST
const res = await http.post('/users', { name: 'Juan' })

// Respuesta
console.log(res.data)     // Datos
console.log(res.status)  // 200
console.log(res.headers) // Headers
```

### Interceptores

```javascript
// Request interceptor
http.interceptRequest(async (request) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
        request.headers.Authorization = `Bearer ${token}`
    }
    return request
})

// Response interceptor
http.interceptResponse(async (response) => {
    console.log(`[API] ${response.status} ${response._raw.url}`)
    return response
})

// Error interceptor
http.interceptError(async (error) => {
    if (error.status === 401) {
        localStorage.removeItem('auth_token')
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    throw error
})
```

### Agregar Headers Default

```javascript
http.setHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
})
```

### Setear Token de Auth

```javascript
http.setAuthToken('jwt-token-here')

// Remover token
http.setAuthToken(null)
```

---

## API Service (Template)

El template incluye un servicio pre-configurado en `services/api.js`:

```javascript
class ApiService extends HttpClient {
    constructor() {
        super({
            baseUrl: $env.get('API_URL', 'https://jsonplaceholder.typicode.com'),
            timeout: 30000
        })
        this._setupInterceptors()
    }

    _setupInterceptors() {
        // Auto-adds Authorization header
        this.interceptRequest(async (request) => {
            const token = localStorage.getItem('auth_token')
            if (token) {
                request.headers.Authorization = `Bearer ${token}`
            }
            return request
        })

        // Handle 401/403 errors
        this.interceptError(async (error) => {
            if (error.status === 401) {
                localStorage.removeItem('auth_token')
                window.dispatchEvent(new CustomEvent('auth:unauthorized'))
            }
            throw error
        })
    }

    // Shorthand methods
    async getTodo(id = 1) {
        const res = await this.get(`/todos/${id}`)
        return res.data
    }

    async getPosts() {
        const res = await this.get('/posts')
        return res.data
    }
}

const api = new ApiService()
export { api }
```

---

## Errores

```javascript
try {
    const data = await $http('/api/users')
} catch (error) {
    if (error.status === 404) {
        console.log('User not found')
    } else if (error.status === 500) {
        console.log('Server error')
    }
}
```

### Propiedades del Error

| Propiedad | Descripción |
|----------|-------------|
| `status` | Código HTTP (0 si network error) |
| `data` | Datos de respuesta |
| `message` | Mensaje de error |

---

## API Reference

### $http

| Método | Descripción |
|--------|-------------|
| `$http.get(url, options)` | GET request |
| `$http.post(url, data, options)` | POST request |
| `$http.put(url, data, options)` | PUT request |
| `$http.delete(url, options)` | DELETE request |
| `$http.create(options)` | Crear instancia |

### HttpClient

| Método | Descripción |
|--------|-------------|
| `get(url, options)` | GET request |
| `post(url, data, options)` | POST request |
| `put(url, data, options)` | PUT request |
| `patch(url, data, options)` | PATCH request |
| `delete(url, options)` | DELETE request |
| `interceptRequest(fn)` | Agregar interceptor de request |
| `interceptResponse(fn)` | Agregar interceptor de response |
| `interceptError(fn)` | Agregar interceptor de error |
| `setHeaders(headers)` | Headers default |
| `setAuthToken(token)` | Token de autenticación |

---

**$http: HTTP simple para casos simples. 🔌**
