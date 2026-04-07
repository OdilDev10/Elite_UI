# Components - SimpleComponent

## Estructura de Componente

Cada componente tiene su carpeta con **HTML y JS separados**:

```
components/
└── Button/
    ├── Button.js    # Lógica del componente
    └── Button.html  # Template (directivas data-*)
```

### Button.js

```javascript
class Button extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            label: 'Button',
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

## Ciclo de Vida

| Método | Cuando se ejecuta |
|--------|-------------------|
| `constructor(selector, props)` | Al crear instancia |
| `render()` | Al montar y cada vez que cambia el estado |
| `onMount()` | Después del primer render |
| `onUnmount()` | Al destruir el componente |
| `onStateChange(newState, prevState)` | Cuando el estado cambia |

---

## State

```javascript
// Obtener estado
this.state           // Retorna copia del estado

// Actualizar estado (re-renderiza automáticamente)
this.setState({ count: 1 })

// Suscribirse a cambios
const unsubscribe = this.subscribe(state => {
    console.log('State changed:', state)
})
```

---

## Props

```javascript
// Recibir props
constructor(selector, props = {}) {
    super(selector, {
        title: 'Default',
        ...props
    })
    this._props = { onClick: null, ...props }
}

// Usar props en métodos
this._props.onClick?.()
```

---

## Templates

### Template Inline en HTML

```html
<template id="tmpl-Button">
    <button
        type="button"
        data-text="label"
        data-onclick="handleClick"
        class="px-6 py-3 rounded-lg font-semibold"
    ></button>
</template>
```

### Cargar Template

```javascript
// En render()
this.el.innerHTML = this.loadTemplate('Button')
//自动查找 id="tmpl-Button"
```

### Template con Props

```javascript
// Pasar datos al template
this.el.innerHTML = this.loadTemplate('ComponentName')

// Los props se acceden con data-text="propName" en el HTML
```

---

## Registrar Componentes

```javascript
// En components/index.js
export { Button } from './Button/Button.js'
export { ThemeToggle } from './ThemeToggle/ThemeToggle.js'

// Registry global
window.__eliteComponents = {
    Button: true,
    ThemeToggle: true
}
```

---

## Uso en HTML

```html
<!-- Template -->
<template id="tmpl-Button">
    <button data-text="label" data-onclick="handleClick"></button>
</template>

<!-- Contenedor -->
<div id="my-button"></div>

<!-- Script -->
<script src="components/Button/Button.js"></script>

<!-- Bootstrap -->
<script>
    const btn = new Button('#my-button', {
        label: 'Click me',
        onClick: () => alert('Clicked!')
    })
    btn.mount()
</script>
```

---

## Componente Completo Ejemplo

### Hero.js

```javascript
class Hero extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: 'Welcome',
            subtitle: 'Subtitle text',
            buttons: [],
            ...props
        })
        this._props = { ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('Hero')
    }

    onMount() {
        this._renderButtons()
    }

    _renderButtons() {
        const outlet = this.el.querySelector('[data-outlet="buttons"]')
        if (!outlet) return
        
        outlet.innerHTML = ''
        this._state.buttons.forEach(btn => {
            const a = document.createElement('a')
            a.href = btn.href
            a.target = btn.target || '_self'
            a.className = `px-6 py-3 rounded-lg ${btn.variant === 'secondary' ? 'bg-zinc-200' : 'bg-green-600'}`
            a.textContent = btn.label
            outlet.appendChild(a)
        })
    }
}

window.Hero = Hero
```

### Hero.html

```html
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2">
        <h1 class="text-5xl font-bold mb-4" data-text="title"></h1>
        <p class="text-lg text-zinc-600 mb-8" data-text="subtitle"></p>
        <div class="flex gap-3" data-outlet="buttons"></div>
    </div>
</div>
```

---

## Best Practices

1. **Separar HTML y JS** - Cada componente en su carpeta
2. **Usar directivas data-*** - No `{{}}` ni `v-*`
3. **Props inmutables** - No modificar props, usar state para cambios
4. **Cleanup en onUnmount** - Remover event listeners
5. **Templates inline** - Para compatibilidad con `file://`

---

**SimpleComponent: Componentes reactivos sin dependencias. 🎨**
