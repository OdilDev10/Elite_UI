/**
 * DomUtils
 * Utilidades para seguridad y animaciones del DOM
 *
 * Sanitización:
 * const safe = sanitize(userInput)
 *
 * Masks (input formatting):
 * const phoneMask = createMask('+1 (XXX) XXX-XXXX')
 * const masked = phoneMask('1234567890')  // '+1 (123) 456-7890'
 *
 * View Transitions:
 * withViewTransition(() => component.setState({ tab: 'new' }))
 */

/**
 * Sanitize HTML to prevent XSS
 * Convierte caracteres especiales en entities
 */
function sanitize(html) {
  if (!html) return ''
  const el = document.createElement('div')
  el.textContent = html
  return el.innerHTML
}

/**
 * Create input mask formatter
 * Pattern: '+1 (XXX) XXX-XXXX' donde X = digit
 *
 * Ejemplos:
 * - Teléfono: createMask('+1 (XXX) XXX-XXXX')
 * - Tarjeta: createMask('XXXX XXXX XXXX XXXX')
 * - Fecha: createMask('XX/XX/XXXX')
 */
function createMask(pattern) {
  return (value) => {
    if (!value) return ''

    // Extraer solo los caracteres que coinciden con X (ignorar espacios, paréntesis, etc)
    let extracted = ''
    const isDigitPattern = pattern.includes('XXX')
    const isAlphaPattern = pattern.includes('AAA')

    for (const char of value) {
      if (isDigitPattern && /\d/.test(char)) {
        extracted += char
      } else if (isAlphaPattern && /[a-zA-Z0-9]/.test(char)) {
        extracted += char
      } else if (!isDigitPattern && !isAlphaPattern) {
        extracted += char
      }
    }

    // Aplicar el patrón
    let result = ''
    let extractedIndex = 0

    for (let i = 0; i < pattern.length && extractedIndex < extracted.length; i++) {
      if (pattern[i] === 'X' || pattern[i] === 'A') {
        result += extracted[extractedIndex]
        extractedIndex++
      } else {
        result += pattern[i]
      }
    }

    return result
  }
}

/**
 * Predefined masks
 */
const Masks = {
  phone: createMask('+1 (XXX) XXX-XXXX'),
  phoneSimple: createMask('(XXX) XXX-XXXX'),
  creditCard: createMask('XXXX XXXX XXXX XXXX'),
  date: createMask('XX/XX/XXXX'),
  ssn: createMask('XXX-XX-XXXX'),
  zipcode: createMask('XXXXX'),
  currency: (value) => {
    const num = parseFloat(value) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }
}

/**
 * Animate DOM changes with View Transition API
 * Fallback para navegadores sin soporte
 */
async function withViewTransition(callback) {
  try {
    if (document.startViewTransition) {
      return new Promise((resolve) => {
        const transition = document.startViewTransition(() => {
          callback()
        })
        transition.finished.then(resolve)
      })
    } else {
      // Fallback: ejecutar sin animación
      callback()
      return Promise.resolve()
    }
  } catch (error) {
    console.error('[DomUtils] viewTransition error:', error)
    callback()
    return Promise.resolve()
  }
}

/**
 * Create debounce wrapper for input events
 * Útil para validación/búsqueda en tiempo real
 */
function debounce(func, delay = 300) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Create throttle wrapper
 */
function throttle(func, limit = 300) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Export
window.sanitize = sanitize
window.createMask = createMask
window.Masks = Masks
window.withViewTransition = withViewTransition
window.debounce = debounce
window.throttle = throttle
