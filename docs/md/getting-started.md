# Getting Started - EliteUI

## Instalación

### Opción 1: NPM (Recomendado)

```bash
npm create @odineck/elite-ui my-app
cd my-app
npm install
npm run dev
```

### Opción 2: CDN (Desarrollo)

```html
<script src="https://cdn.jsdelivr.net/npm/@odineck/elite-ui@latest/dist/elite-ui.min.js"></script>
```

---

## Estructura de un Componente

Cada componente tiene su carpeta:

```
components/
└── Button/
    ├── Button.js    # Lógica
    └── Button.html  # Template
```

### Button.js

```javascript
class Button extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            label: 'Click me',
            variant: 'primary',
            ...props
        })
        this._props = { onClick: null, ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('Button')
    }

    handleClick(e) {
        e.preventDefault()
        this._props.onClick?.(e)
    }
}

window.Button = Button
```

### Button.html

```html
<button
    type="button"
    data-text="label"
    data-onclick="handleClick"
    data-class-bg-green-600="variant !== 'secondary'"
    data-class-bg-zinc-200="variant === 'secondary'"
    class="px-6 py-3 rounded-lg font-semibold transition-all"
></button>
```

---

## Cargar Componentes en HTML

```html
<!-- Template inline (para file:// compatibility) -->
<template id="tmpl-Button">
    <button
        type="button"
        data-text="label"
        data-onclick="handleClick"
        class="px-6 py-3 rounded-lg font-semibold"
    ></button>
</template>

<!-- Contenedor -->
<div id="my-button"></div>

<!-- Scripts -->
<script src="dist/elite-ui.min.js"></script>
<script src="components/Button/Button.js"></script>

<!-- Bootstrap -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const btn = new Button('#my-button', {
            label: 'Enviar',
            onClick: () => alert('Click!')
        })
        btn.mount()
    })
</script>
```

---

## Sistema de Themes

```html
<!-- En el tag HTML -->
<html data-theme="light">
```

```javascript
// ThemeToggle component
const toggle = new ThemeToggle('#theme-toggle', { theme: 'light' })
toggle.mount()

// Cambiar manualmente
document.documentElement.setAttribute('data-theme', 'dark')
localStorage.setItem('elite-theme', 'dark')
```

---

## Variables de Entorno

```html
<head>
    <meta name="env" 
          data-api-url="https://api.example.com"
          data-api-key="abc123">
</head>
```

```javascript
// Usar en código
const apiUrl = $env.get('API_URL')
const timeout = $env.get('TIMEOUT', '30000')
```

---

## Store (State Management)

```javascript
// Crear store
const store = createStore({
    count: 0,
    user: null
})

// Suscribirse
store.subscribe((state) => {
    console.log('State changed:', state)
})

// Actualizar
store.setState({ count: 1 })
```

---

## Router

```javascript
// Configurar rutas en router/index.js
const routes = [
    { path: '/', component: 'HomePage' },
    { path: '/admin', guards: ['isAdmin'] }
]

// Navegar
router.navigate('/')
```

---

## Permisos

```javascript
// Definir roles
$permissions.define('admin', ['read', 'write', 'delete'])

// Asignar
$permissions.grant('user123', 'admin')

// Verificar
$permissions.can('write')  // true/false
```

---

## i18n (Traducciones)

```javascript
// Inicializar
initI18n('es')

// Traducir
$t('home.title')  // 'Bienvenido'
```

---

## Bootstrap Completo

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <!-- Templates -->
    <template id="tmpl-Button">...</template>
    
    <!-- App -->
    <div id="app"></div>
    
    <!-- Framework -->
    <script src="dist/elite-ui.min.js"></script>
    
    <!-- Components -->
    <script src="components/Button/Button.js"></script>
    
    <!-- Bootstrap -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const btn = new Button('#app', { label: 'Click' })
            btn.mount()
        })
    </script>
</body>
</html>
```

---

## Próximos Pasos

1. Revisa [Directivas](directives.md) para reactivity
2. Configura [Router](router.md) para navegación
3. Implementa [Permissions](permissions.md) para seguridad
4. Usa [i18n](i18n.md) para traducciones

---

**¡Listo para construir! 🚀**
