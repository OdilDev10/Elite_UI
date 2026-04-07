/**
 * ErrorBoundary
 * Captura errores de componentes y maneja fallbacks
 *
 * Uso:
 * const boundary = new ErrorBoundary(fallbackUI)
 * boundary.catch(component)
 */

class ErrorBoundary {
  constructor(fallbackUI = null) {
    this._fallbackUI = fallbackUI
    this._errors = []
    this._errorHandlers = []
    this._recoveryHandlers = []
  }

  /**
   * Ejecutar componente con error handling
   * @param {Function|Promise} fn
   * @param {string} context
   */
  async catch(fn, context = 'unknown') {
    try {
      if (typeof fn === 'function') {
        const result = fn()
        if (result instanceof Promise) {
          return await result
        }
        return result
      } else {
        return await fn
      }
    } catch (error) {
      this._handleError(error, context)
      return this._getFallback()
    }
  }

  /**
   * Register error handler
   */
  onError(handler) {
    this._errorHandlers.push(handler)
    return () => {
      this._errorHandlers = this._errorHandlers.filter(h => h !== handler)
    }
  }

  /**
   * Register recovery handler
   */
  onRecover(handler) {
    this._recoveryHandlers.push(handler)
    return () => {
      this._recoveryHandlers = this._recoveryHandlers.filter(h => h !== handler)
    }
  }

  _handleError(error, context) {
    const errorEntry = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context,
      error
    }

    this._errors.push(errorEntry)

    // Keep only last 50 errors
    if (this._errors.length > 50) {
      this._errors.shift()
    }

    // Call handlers
    this._errorHandlers.forEach(handler => {
      try {
        handler(error, context)
      } catch (e) {
        console.error('[ErrorBoundary] handler error:', e)
      }
    })

    // Log error
    console.error(`[ErrorBoundary] ${context}:`, error)
  }

  _getFallback() {
    if (this._fallbackUI) {
      if (typeof this._fallbackUI === 'function') {
        return this._fallbackUI(this._errors[this._errors.length - 1])
      }
      return this._fallbackUI
    }

    return {
      ok: false,
      error: this._errors[this._errors.length - 1]?.message || 'Unknown error'
    }
  }

  /**
   * Recover from error
   */
  recover() {
    if (this._errors.length === 0) return

    this._errors.pop()

    this._recoveryHandlers.forEach(handler => {
      try {
        handler()
      } catch (e) {
        console.error('[ErrorBoundary] recovery handler error:', e)
      }
    })
  }

  /**
   * Get errors
   */
  getErrors() {
    return [...this._errors]
  }

  /**
   * Clear errors
   */
  clearErrors() {
    this._errors = []
  }

  /**
   * Debug
   */
  debug() {
    console.group('[ErrorBoundary]')
    console.log('Total errors:', this._errors.length)
    console.table(this._errors.map(e => ({
      context: e.context,
      message: e.message,
      time: new Date(e.timestamp).toLocaleTimeString()
    })))
    console.groupEnd()
  }
}

// Global error boundary (para eventos no capturados)
class GlobalErrorBoundary {
  constructor() {
    this._handlers = []
    this._setup()
  }

  _setup() {
    window.addEventListener('error', (event) => {
      this._handleError(event.error, 'uncaughtError')
    })

    window.addEventListener('unhandledrejection', (event) => {
      this._handleError(event.reason, 'unhandledPromiseRejection')
    })
  }

  onError(handler) {
    this._handlers.push(handler)
    return () => {
      this._handlers = this._handlers.filter(h => h !== handler)
    }
  }

  _handleError(error, type) {
    this._handlers.forEach(handler => {
      try {
        handler(error, type)
      } catch (e) {
        console.error('[GlobalErrorBoundary] handler error:', e)
      }
    })
  }
}

window.ErrorBoundary = ErrorBoundary
window.GlobalErrorBoundary = new GlobalErrorBoundary()
