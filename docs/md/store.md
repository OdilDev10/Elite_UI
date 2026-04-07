# SimpleStore

Global state management with subscriptions.

## Create Store

```javascript
const store = new SimpleStore({
    theme: 'dark',
    user: null,
    count: 0
})
```

## Get/Set State

```javascript
store.getState()              // Get all state
store.getValue('theme')       // Get single value

store.setState({ theme: 'light' })
store.setState((state) => ({ count: state.count + 1 }))
```

## Subscribe

```javascript
const unsubscribe = store.subscribe((newState, prevState) => {
    console.log('State changed:', newState)
})

// Later: unsubscribe()
```

## Computed Values

```javascript
store.compute('fullName', (state) => {
    return state.firstName + ' ' + state.lastName
})
```

## Middleware

```javascript
store.use((state, prevState) => {
    $debug.log('State updated:', state)
})
```