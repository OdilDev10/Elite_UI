# Servicios - API, Auth, Cart

## Overview

El template de EliteUI incluye servicios pre-construidos para acelerar el desarrollo: API, Auth y Cart.

---

## API Service

### Configuración

```javascript
// api.js - Usa HttpClient del core con interceptors
import { api } from './services/api.js'

// Configuración desde $env
// API_URL en meta tag o window.ENV
```

### Uso

```javascript
// GET requests
const todo = await api.getTodo(1)
const posts = await api.getPosts()
const users = await api.getUsers()

// Métodos HTTP
const data = await api.get('/endpoint')
const result = await api.post('/endpoint', { data })
const result = await api.put('/endpoint', { id: 1 }, { data })
const result = await api.delete('/endpoint/1')

// Respuesta completa
const response = await api.get('/users')
console.log(response.data)    // datos
console.log(response.status) // 200
console.log(response.headers)// headers
```

### Interceptores

```javascript
// Request interceptor (automático)
// Añade Authorization token si existe
const token = localStorage.getItem('auth_token')
if (token) {
    request.headers.Authorization = `Bearer ${token}`
}

// Response interceptor (automático)
// Loggea requests exitosos

// Error interceptor (automático)
// Handle 401 → limpia auth y dispara evento
// Handle 403 → dispara evento
```

---

## Auth Service

### Configuración

```javascript
// auth.js - Usa api.js internamente
import { auth } from './services/auth.js'
```

### Uso

```javascript
// Login
const result = await auth.login('email@example.com', 'password123')
if (result.success) {
    console.log('User:', result.user)
} else {
    console.error('Error:', result.error)
}

// Register
const result = await auth.register({
    email: 'email@example.com',
    password: 'password123',
    name: 'Juan'
})

// Logout
auth.logout()

// Check auth
if (auth.isAuthenticated()) {
    // Usuario logueado
}

// Usuario actual
const user = auth.currentUser()

// Token
const token = auth.getToken()
```

### Eventos

```javascript
// Cuando el token expira o es inválido
window.addEventListener('auth:unauthorized', () => {
    auth.logout()
    router.navigate('/login')
})

// Cuando se hace logout
window.addEventListener('auth:logged_out', () => {
    console.log('Logged out')
})
```

---

## Cart Service

### Configuración

```javascript
// cart.js - Usa store para estado reactivo
import { cart } from './services/cart.js'
```

### Uso

```javascript
// Añadir item
await cart.addItem({ productId: 1, quantity: 2 })

// Remover item
cart.removeItem(productId)

// Actualizar cantidad
cart.updateQuantity(productId, 3)

// Obtener items
const items = cart.getItems()

// Contar items
const count = cart.getCount()

// Total
const total = cart.getTotal()

// Limpiar carrito
cart.clear()

// Checkout
const result = await cart.checkout()
if (result.success) {
    console.log('Order:', result.order)
}

// Suscripción a cambios
cart.subscribe((state) => {
    console.log('Cart:', state.items.length, 'items')
    console.log('Total:', state.total)
})
```

### Ejemplo de Carrito en UI

```javascript
class CartPage extends SimpleComponent {
    constructor() {
        super('#cart', {
            items: cart.getItems(),
            total: cart.getTotal()
        })
        
        cart.subscribe((state) => {
            this.setState({
                items: state.items,
                total: state.total
            })
            this.render()
        })
    }

    render() {
        this.el.innerHTML = `
            <h1>Cart (${this.state.items.length} items)</h1>
            <p>Total: $${this.state.total}</p>
            <button data-onclick="checkout">Checkout</button>
        `
    }

    async checkout() {
        const result = await cart.checkout()
        if (result.success) {
            alert('Order placed!')
        }
    }
}
```

---

## Crear un Nuevo Servicio

```javascript
// services/users.js
import { api } from './api.js'

class UsersService {
    async getAll() {
        const res = await api.get('/users')
        return res.data
    }

    async getById(id) {
        const res = await api.get(`/users/${id}`)
        return res.data
    }

    async create(data) {
        const res = await api.post('/users', data)
        return res.data
    }

    async update(id, data) {
        const res = await api.put(`/users/${id}`, data)
        return res.data
    }

    async delete(id) {
        const res = await api.delete(`/users/${id}`)
        return res.data
    }
}

const usersService = new UsersService()
export { usersService }
```

---

## Integración de Servicios

```javascript
// En bootstrap
import { api } from './services/api.js'
import { auth } from './services/auth.js'
import { cart } from './services/cart.js'

// Verificar auth al cargar app
if (auth.isAuthenticated()) {
    // Cargar datos del usuario
    const user = auth.currentUser()
    $permissions.grant(user.id, user.role)
}
```

---

**EliteUI Services: Backend connectivity ready. 🔌**
