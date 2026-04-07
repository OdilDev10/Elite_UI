# ModuleLoader

Automatic module loading and component registration.

## components/index.js

Register all components:

```javascript
window.__eliteComponents = {
    Button: true,
    Hero: true,
    ThemeToggle: true,
    CodeCard: true,
    FeatureCard: true,
    FormCard: true
}
```

## Load Components

```javascript
await moduleLoader.loadComponents()
// Loads:
// - components/{Name}/{Name}.css
// - components/{Name}/{Name}.js
```

## Configure Router

```javascript
moduleLoader.initRouter({ useHash: true })
moduleLoader.loadRoutes(routeConfig)
```

## Wait for Ready

```javascript
moduleLoader.whenReady(() => {
    // All components loaded
})
```

## Events

```javascript
window.addEventListener('EliteUI:ready', () => {
    // All components loaded
})
```

## Get Component

```javascript
moduleLoader.getComponent('Hero')     // { class, config, loaded }
moduleLoader.hasComponent('Hero')     // true/false
moduleLoader.getAllComponents()       // { Hero: {...}, ... }
```