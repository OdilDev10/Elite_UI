# Store - State Management

## Overview

El Store de EliteUI es un sistema de state management simple inspirado en Zustand. Permite crear stores reactivos con subscriptions.

## Uso Básico

```javascript
// Crear store
const store = createStore({
    count: 0,
    user: null,
    items: []
})

// Obtener estado
store.getState()  // { count: 0, user: null, items: [] }

// Actualizar estado
store.setState({ count: 1 })
```

---

## Suscripciones

```javascript
// Suscribirse a cambios
const unsubscribe = store.subscribe((newState, previousState) => {
    console.log('Estado cambió:', newState)
})

// Cancelar suscripción
unsubscribe()
```

---

## Uso con Componentes

```javascript
// Crear store para el carrito
const cartStore = createStore({
    items: [],
    total: 0,
    count: 0
})

// En el componente
class Cart extends SimpleComponent {
    constructor() {
        super('#cart', {
            items: cartStore.getState().items,
            total: cartStore.getState().total
        })
        
        // Suscribirse a cambios
        cartStore.subscribe((state) => {
            this.setState({
                items: state.items,
                total: state.total
            })
        })
    }

    addItem(product) {
        const state = cartStore.getState()
        cartStore.setState({
            items: [...state.items, product],
            total: state.total + product.price,
            count: state.count + 1
        })
    }
}
```

---

## Ejemplo: Auth Store

```javascript
const authStore = createStore({
    user: null,
    isAuthenticated: false,
    token: null
})

// Login
authStore.setState({
    user: response.user,
    isAuthenticated: true,
    token: response.token
})

// Logout
authStore.setState({
    user: null,
    isAuthenticated: false,
    token: null
})

// Check auth
if (authStore.getState().isAuthenticated) {
    // Mostrar dashboard
}
```

---

## Múltiples Stores

```javascript
// Stores separados
const userStore = createStore({ user: null, profile: {} })
const cartStore = createStore({ items: [], total: 0 })
const uiStore = createStore({ theme: 'light', sidebar: false })

// Suscripción individual
userStore.subscribe((state) => {
    console.log('User changed:', state.user)
})
```

---

## Actualizaciones Funcionales

```javascript
// Con función para calcular nuevo estado
store.setState((prevState) => {
    return {
        ...prevState,
        count: prevState.count + 1
    }
})
```

---

## Integración con Permisos

```javascript
// Al hacer login
authStore.subscribe((state) => {
    if (state.user) {
        $permissions.grant(state.user.id, state.user.role)
    } else {
        $permissions.revoke($permissions.getCurrentUser())
    }
})
```

---

## API Reference

| Método | Descripción |
|--------|-------------|
| `getState()` | Obtiene estado actual |
| `setState(updates)` | Actualiza estado |
| `subscribe(listener)` | Suscribe a cambios |
| `createStore(initialState)` | Factory para crear stores |

---

## Ejemplo Completo

```javascript
// 1. Crear store
const cartStore = createStore({
    items: [],
    total: 0,
    loading: false
})

// 2. Suscribirse
cartStore.subscribe((state) => {
    console.log('Cart updated:', state.items.length, 'items')
})

// 3. Usar en componente
class CartIcon extends SimpleComponent {
    constructor() {
        super('#cart-icon', {
            count: cartStore.getState().items.length
        })
        
        cartStore.subscribe((state) => {
            this.setState({ count: state.items.length })
        })
    }
}

// 4. Modificar desde cualquier lugar
function addToCart(product) {
    const state = cartStore.getState()
    cartStore.setState({
        items: [...state.items, product],
        total: state.total + product.price
    })
}
```

---

**EliteUI Store: State management simple y efectivo. 📦**
