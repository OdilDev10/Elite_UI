# VS Code Snippets - EliteUI

## Overview

EliteUI includes **60+ VS Code snippets** to accelerate development. They are available in `.vscode/snippets.code-snippets` and cover components, services, directives, router, and more.

---

## How to Install

### For New Projects
```bash
npm create @odineck/elite-ui my-app
cd my-app
npm install
```
The snippets are automatically included in `.vscode/snippets.code-snippets`.

### For Existing Projects
Copy the snippets file:
```bash
# From npm package (if available)
cp node_modules/@odineck/elite-ui/template/.vscode/snippets.code-snippets .vscode/

# Or copy from local template
cp /path/to/elite_ui/template/.vscode/snippets.code-snippets .vscode/
```

---

## Usage

Open any `.js` or `.html` file in VS Code and type the prefix:

| Prefix | Description | Trigger |
|--------|-------------|---------|
| `elite-component` | Create new component | `elite-component` + Tab |
| `elite-page` | Create page component | `elite-page` + Tab |
| `elite-stateful` | Component with reactive state | `elite-stateful` + Tab |
| `elite-form` | Form component with validation | `elite-form` + Tab |
| `elite-list` | List component | `elite-list` + Tab |
| `elite-modal` | Modal component | `elite-modal` + Tab |
| `elite-service` | Service class | `elite-service` + Tab |
| `elite-store` | Reactive store | `elite-store` + Tab |

---

## Component Snippets

### Basic Component
```javascript
elite-component
```
Creates:
```javascript
class Name extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            prop: value,
            ...props,
        })
        this._props = { ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('name')
    }
}

window.Name = Name
```

### Stateful Component
```javascript
elite-stateful
```
Creates component with increment/decrement methods and reactive state.

### Form Component
```javascript
elite-form
```
Creates form with validation, input handling, and submit logic.

### List Component
```javascript
elite-list
```
Creates component for rendering lists with loading state.

### Modal Component
```javascript
elite-modal
```
Creates modal with open/close methods and backdrop click handling.

---

## Router Snippets

### Router Setup
```javascript
elite-router-init
```
Creates:
```javascript
const router = new EliteRouter({
    useHash: true,
    layout: 'main-layout',
})

router.addRoutes([
    {
        path: '/',
        component: 'HomePage',
        container: '#app',
        meta: { title: 'Home' },
    },
    // ... more routes
])

window.$router = router
```

### Route Definition
```javascript
elite-route
```

### Guard
```javascript
elite-guard
```

### Middleware
```javascript
elite-middleware
```

---

## Service Snippets

### Service Class
```javascript
elite-service
```
Creates service with CRUD methods:
```javascript
class NameService {
    constructor() {
        this._baseUrl = $env.get('API_URL', '')
        this._http = $http.create({ baseUrl: this._baseUrl })
    }

    async getAll() { return this._http.get('/endpoint') }
    async getById(id) { return this._http.get(`/endpoint/${id}`) }
    async create(data) { return this._http.post('/endpoint', data) }
    async update(id, data) { return this._http.put(`/endpoint/${id}`, data) }
    async delete(id) { return this._http.delete(`/endpoint/${id}`) }
}

const nameService = new NameService()
export { nameService }
```

### Custom HTTP Client
```javascript
elite-http-custom
```

---

## Store Snippets

### Reactive Store
```javascript
elite-store
```
Creates:
```javascript
class NameStore extends SimpleStore {
    constructor() {
        super({
            items: [],
            loading: false,
            error: null,
        })
    }

    async fetchItems() {
        this.setState({ loading: true, error: null })
        try {
            const items = await $http.get('/api/items')
            this.setState({ items, loading: false })
        } catch (err) {
            this.setState({ error: err.message, loading: false })
        }
    }
}
```

---

## Directive Snippets

All directive snippets use prefix `elite-d-` followed by directive name:

| Prefix | Directive | Example |
|--------|-----------|---------|
| `elite-d-text` | `data-text` | `<span data-text="title"></span>` |
| `elite-d-html` | `data-html` | `<div data-html="content"></div>` |
| `elite-d-show` | `data-show` | `<div data-show="isVisible"></div>` |
| `elite-d-if` | `data-if` | `<div data-if="isOpen"></div>` |
| `elite-d-bind` | `data-bind` | `<input data-bind="email" />` |
| `elite-d-click` | `data-onclick` | `<button data-onclick="handleClick"></button>` |
| `elite-d-change` | `data-onchange` | `<select data-onchange="update"></select>` |
| `elite-d-input` | `data-oninput` | `<input data-oninput="search" />` |
| `elite-d-submit` | `data-onsubmit` | `<form data-onsubmit="submit"></form>` |
| `elite-d-keyup` | `data-onkeyup` | `<input data-onkeyup="onKey" />` |
| `elite-d-keydown` | `data-onkeydown` | `<input data-onkeydown="onKey" />` |
| `elite-d-hover` | `data-onhover` | `<div data-onhover="onHover"></div>` |
| `elite-d-focus` | `data-onfocus` | `<input data-onfocus="onFocus" />` |
| `elite-d-blur` | `data-onblur` | `<input data-onblur="onBlur" />` |
| `elite-d-disabled` | `data-disabled` | `<button data-disabled="isBusy">Send</button>` |
| `elite-d-value` | `data-value` | `<input data-value="message" />` |
| `elite-d-checked` | `data-checked` | `<input type="checkbox" data-checked="isActive" />` |
| `elite-d-placeholder` | `data-placeholder` | `<input data-placeholder="hint" />` |
| `elite-d-title` | `data-title` | `<button data-title="tooltip">Hover</button>` |
| `elite-d-href` | `data-href` | `<a data-href="url">Link</a>` |
| `elite-d-src` | `data-src` | `<img data-src="imageUrl" />` |
| `elite-d-link` | `data-link` | `<a data-link="/">Home</a>` |
| `elite-d-class` | `data-class-*` | `<button data-class-active="isActive">Click</button>` |
| `elite-d-permission` | `data-permission` | `<div data-permission="admin.write"></div>` |
| `elite-d-role` | `data-role` | `<div data-role="admin"></div>` |
| `elite-d-attr` | `data-attr-*` | `<div data-attr-aria-label="label"></div>` |
| `elite-d-style` | `data-style-*` | `<div data-style-color="color"></div>` |

---

## Utility Snippets

### Mount Component
```javascript
elite-mount
```
```javascript
const component = new ComponentName('#element-id', {
    prop: value,
})
component.mount()
```

### useEffect
```javascript
elite-effect
```
```javascript
this.useEffect(() => {
    // effect logic
    return () => { /* cleanup */ }
}, [dependencies])
```

### Child Component Registration
```javascript
elite-child
```

### Event Emission
```javascript
elite-emit
```

### Lazy Load
```javascript
elite-lazy
```

### Error Boundary
```javascript
elite-error-boundary
```

### Template HTML
```javascript
elite-template
```
Creates `<template id="tmpl-component">...</template>`

### i18n Setup
```javascript
elite-i18n
```

### Validator Rule
```javascript
elite-validator
```

### useForm Hook
```javascript
elite-useform
```

### Debug Log
```javascript
elite-debug
```

### Debug Track
```javascript
elite-debug-track
```

---

## HTTP Snippets

| Prefix | Description |
|--------|-------------|
| `elite-http-get` | GET request |
| `elite-http-post` | POST request |
| `elite-http-put` | PUT request |
| `elite-http-delete` | DELETE request |

---

## Quick Reference

```
Component:     elite-component, elite-page, elite-stateful, elite-form, elite-list, elite-modal
Service:        elite-service
Store:          elite-store
Router:         elite-router-init, elite-route, elite-guard, elite-middleware
Layout:         elite-layout
Mount:          elite-mount
Lifecycle:      elite-effect, elite-child, elite-emit, elite-lazy, elite-error-boundary
Directives:     elite-d-{name} (see table above)
HTTP:           elite-http-get, elite-http-post, elite-http-put, elite-http-delete
Utils:          elite-template, elite-i18n, elite-validator, elite-useform, elite-debug
```

---

## File Location

The snippets file is located at:

- **Template source**: `template/.vscode/snippets.code-snippets`
- **Copied to project on scaffold**: `.vscode/snippets.code-snippets`

When you run `npm create @odineck/elite-ui my-app`, the scaffolding tool automatically copies the snippets to your new project's `.vscode/` folder.

---

**EliteUI: Fast development with smart snippets. 🚀**