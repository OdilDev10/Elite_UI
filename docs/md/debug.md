# $debug

Debug tools and lifecycle tracking.

## Logging

```javascript
$debug.log('Info message', { data })
$debug.warn('Warning message')
$debug.error('Error occurred', error)
$debug.info('Details')
$debug.group('My Group')
$debug.groupEnd()
```

## Performance

```javascript
$debug.time('api-request')
await $http('/api/users')
$debug.timeEnd('api-request')  // Logs: "api-request: 245ms"
```

## Lifecycle Tracking

```javascript
// Automatic - tracks all SimpleComponent instances
$debug.trackComponent('Hero', 'mount')
$debug.trackComponent('Hero', 'unmount')
$debug.trackComponent('Hero', 'render')

// Get history
$debug.getLifecycle('Hero')
// [{ event: 'mount', timestamp: 1234567890, data: {} }, ...]

// All components
$debug.getLifecycle()
```

## DevTools Panel

```javascript
$debug.panel()        // View all logs and components in console
$debug.exportLogs()   // Download as JSON file
$debug.clearLogs()    // Clear all logs
```

## State Snapshots

```javascript
$debug.snapshot('before-login', store.getState())
```

## Auto-enable

$debug is automatically enabled when:
- `location.hostname === 'localhost'`
- `location.hostname === '127.0.0.1'`
- URL contains `?debug`

```javascript
$debug.enable()
$debug.disable()
$debug.isEnabled()
```