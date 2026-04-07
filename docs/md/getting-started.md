# EliteUI Framework

Zero dependencies. Security first. Production ready.

## Quick Start

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<script src="core/http.js"></script>
<script src="core/debug.js"></script>
<script src="core/schema.js"></script>

<div id="app"></div>

<script type="module">
    import { moduleLoader } from './core/ModuleLoader.js'
    
    await moduleLoader.loadComponents()
    
    if (window.ThemeToggle) {
        new ThemeToggle('#theme-toggle-container').mount()
    }
</script>
```

## File Structure

```
elite_ui/
├── index.html              # Home page
├── css/main.css            # Base styles (green accent)
│
├── core/                   # Framework core
│   ├── SimpleComponent.js  # Base component class
│   ├── SimpleStore.js      # State management
│   ├── Router.js           # Routing
│   ├── ModuleLoader.js     # Auto-loading
│   ├── http.js             # $http client
│   ├── debug.js            # $debug tools
│   ├── schema.js           # $schema validation
│   └── Validators.js       # Input validators
│
├── components/             # Reusable components
│   ├── index.js            # Component registry
│   ├── Button/
│   ├── Hero/
│   ├── ThemeToggle/
│   └── ...
│
├── pages/                  # Page configs
│   ├── router.js           # Routes definition
│   └── example/
│
└── docs/                   # Documentation
    ├── index.html
    └── md/                 # Quick reference
```

## Core Tools

| Tool | Purpose |
|------|---------|
| `$http` | Simple HTTP client |
| `$schema` | Data validation |
| `$debug` | Debugging & tracking |
| `Validators` | Input validators |
| `SimpleStore` | State management |
| `Router` | Client routing |

## Component Pattern

```javascript
// components/MyComponent/MyComponent.js
class MyComponent extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector)
        this._props = { ...props }
    }

    async render() {
        this.el.className = 'bento-card'
        this.el.innerHTML = await this.loadTemplate('MyComponent', this._props)
    }
}

window.MyComponent = MyComponent
```

```html
<!-- components/MyComponent/MyComponent.html -->
<div class="my-component">
    <h1>{{title}}</h1>
</div>
```

## Security Features

- XSS protection via `_escapeHtml()`
- SQL injection detection
- Route sanitization
- Input validation
- CSRF token support

## Theme

Default accent color: green (`--accent: #16a34a`)

Toggle dark mode with `ThemeToggle` component.