# Sistema de Permisos - $permissions

## Overview

El sistema de permisos de EliteUI proporciona control de acceso basado en roles (RBAC) ligero y seguro.

## Uso Básico

```javascript
// Verificar permiso
$permissions.can('users.write')  // true/false

// Verificar rol
$permissions.isRole('admin')  // true/false

// Verificar sin usuario actual (especificar userId)
$permissions.has('user123', 'profile.read')
```

---

## Definir Roles y Permisos

```javascript
// Definir rol con permisos
$permissions.define('admin', [
    'users.read',
    'users.write', 
    'users.delete',
    'admin.access',
    'settings.manage'
])

$permissions.define('user', [
    'users.read',
    'profile.read',
    'profile.write'
])

$permissions.define('guest', [
    'home.read'
])
```

---

## Asignar Roles a Usuarios

```javascript
// Asignar rol a usuario
$permissions.grant('user123', 'admin')

// Asignar y marcar como usuario actual
$permissions.grant('user123', 'admin')  // Si es el primero, se marca como currentUser

// Cambiar usuario actual
$permissions.setCurrentUser('user456')

// Obtener usuario actual
$permissions.getCurrentUser()  // 'user456'
```

---

## Verificar Permisos

```javascript
// Verificar con usuario actual
$permissions.can('users.write')  // Depende del rol del usuario actual

// Verificar con usuario específico
$permissions.has('user123', 'users.write')

// Verificar rol
$permissions.is('user123', 'admin')  // true/false
$permissions.isRole('admin')  // Verifica usuario actual
```

---

## Permisos con Wildcards

```javascript
// Si tienes permiso 'admin.*', tienes acceso a cualquier permiso que empiece con 'admin.'
$permissions.define('admin', ['admin.*'])

$permissions.can('admin.users')      // true
$permissions.can('admin.settings')    // true
$permissions.can('adminanything')    // false (no empieza con admin.)
```

---

## Directivas de Permisos en HTML

### data-permission

Oculta elementos basado en permisos:

```html
<!-- Solo visible si el usuario tiene permiso 'users.delete' -->
<button data-permission="users.delete">Delete User</button>

<!-- Visible solo para admins -->
<button data-permission="admin.access">Admin Panel</button>
```

### data-role

Oculta elementos basado en rol:

```html
<!-- Solo visible si el usuario es 'admin' -->
<div data-role="admin">
    <h1>Admin Dashboard</h1>
</div>

<!-- Solo visible si el usuario es 'user' -->
<div data-role="user">
    <h1>User Dashboard</h1>
</div>
```

---

## Ejemplo Completo

```javascript
// 1. Definir roles
$permissions.define('admin', ['read', 'write', 'delete', 'admin.access'])
$permissions.define('user', ['read', 'profile.read'])
$permissions.define('guest', ['read'])

// 2. Asignar roles
$permissions.grant('john', 'user')
$permissions.grant('maria', 'admin')

// 3. Cambiar a usuario actual
$permissions.setCurrentUser('maria')

// 4. Verificar
$permissions.can('write')           // true (maria es admin)
$permissions.can('profile.read')   // true
$permissions.isRole('admin')       // true

// 5. En HTML
// <button data-permission="delete">Delete</button>  // Visible para maria
```

---

## Eventos

```javascript
// Cuando el token expira o auth falla
window.addEventListener('auth:unauthorized', () => {
    $permissions.revoke($permissions.getCurrentUser())
    router.navigate('/login')
})

// Cuando se hace logout
window.addEventListener('auth:logged_out', () => {
    $permissions.revoke($permissions.getCurrentUser())
})
```

---

## Reset / Limpieza

```javascript
// Remover rol de un usuario
$permissions.revoke('user123')

// Remover definición de rol
$permissions.removeRole('temporary-role')

// Limpiar todo
$permissions.reset()
```

---

## Integración con Router

```javascript
// En la configuración de rutas
const routes = [
    {
        path: '/admin',
        component: 'AdminPage',
        guards: ['isAuthenticated', 'isAdmin']  // Usa permisos como guards
    },
    {
        path: '/profile',
        component: 'ProfilePage',
        guards: ['isAuthenticated']
    }
]
```

---

## Roles por Defecto

El framework incluye roles predefinidos:

```javascript
$permissions.define('guest', ['read'])
$permissions.define('user', ['read', 'profile.read'])
$permissions.define('admin', ['read', 'write', 'delete', 'admin.access'])
```

Puedes eliminarlos o modificarlos según necesites.

---

**EliteUI Permissions: Seguridad simple pero poderosa. 🔒**
