# Components

## SimpleComponent

Base class for all EliteUI components.

```javascript
class MyComponent extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector)
        this._props = {
            title: 'Default',
            ...props
        }
    }

    onMount() {
        // Called after render
    }

    async render() {
        this.el.innerHTML = await this.loadTemplate('MyComponent', {
            title: this._props.title
        })
    }
}

new MyComponent('#app', { title: 'Hello' }).mount()
```

## Lifecycle

- `onMount()` - Called after first render
- `onUnmount()` - Called on cleanup
- `onStateChange(newState, prevState)` - Called when state updates

## State

```javascript
this.state              // Get state (returns copy)
this.setState({ key: value })  // Update state, triggers re-render
this.subscribe(cb)      // Listen to state changes, returns unsubscribe fn
```

## Events

```javascript
this.on('click', '.btn', handler)  // Event delegation
this.off('click', handler)         // Remove listener
```

## Effects

```javascript
this.useEffect(() => {
    // Side effect
    return () => { /* cleanup */ }
}, [dependency])
```

## Template Loading

```javascript
// 1. Create components/MyComponent/MyComponent.html
// 2. Use in render():
this.el.innerHTML = await this.loadTemplate('MyComponent', { key: value })
```

## Child Components

```javascript
const child = this.registerChild(new ChildComponent(el))
child.mount()
// On unmount, all children auto-unmount
```