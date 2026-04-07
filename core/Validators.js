/**
 * Validators
 * Mini-Zod: Schema validation sin dependencias
 * Validadores de seguridad prebuilts
 *
 * Uso:
 * Validators.email('user@example.com')        // null (válido)
 * Validators.email('invalid')                  // 'Invalid email' (error)
 * Validators.password('Pass123!', { min: 12 }) // null o error
 *
 * En useForm:
 * email: {
 *   value: '',
 *   validate: [Validators.email]
 * }
 */

const Validators = {
  /**
   * Required field
   */
  required: (message = 'This field is required') => {
    return (value) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message
      }
      return null
    }
  },

  /**
   * Email validation
   */
  email: (value, message = 'Invalid email') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) return null
    return emailRegex.test(value) ? null : message
  },

  /**
   * URL validation
   */
  url: (value, message = 'Invalid URL') => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  },

  /**
   * Phone validation (basic)
   */
  phone: (value, message = 'Invalid phone number') => {
    if (!value) return null
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
    return phoneRegex.test(value.replace(/\D/g, '')) ? null : message
  },

  /**
   * Credit card validation (Luhn algorithm)
   */
  creditCard: (value, message = 'Invalid credit card') => {
    if (!value) return null

    const cardNumber = value.replace(/\D/g, '')
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return message
    }

    // Luhn algorithm
    let sum = 0
    let isEven = false

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10)

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0 ? null : message
  },

  /**
   * Password strength validation
   * Options: { min: 8, requireUppercase: true, requireNumbers: true, requireSpecial: true }
   */
  password: (value, options = {}) => {
    if (!value) return 'Password is required'

    const {
      min = 8,
      requireUppercase = true,
      requireNumbers = true,
      requireSpecial = true
    } = options

    const errors = []

    if (value.length < min) {
      errors.push(`At least ${min} characters`)
    }

    if (requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('At least one uppercase letter')
    }

    if (requireNumbers && !/\d/.test(value)) {
      errors.push('At least one number')
    }

    if (requireSpecial && !/[!@#$%^&*]/.test(value)) {
      errors.push('At least one special character (!@#$%^&*)')
    }

    return errors.length ? errors.join(', ') : null
  },

  /**
   * Min length
   */
  minLength: (min, message = `Minimum ${min} characters`) => {
    return (value) => {
      if (!value) return null
      return value.length >= min ? null : message
    }
  },

  /**
   * Max length
   */
  maxLength: (max, message = `Maximum ${max} characters`) => {
    return (value) => {
      if (!value) return null
      return value.length <= max ? null : message
    }
  },

  /**
   * Pattern matching
   */
  pattern: (regex, message = 'Invalid format') => {
    return (value) => {
      if (!value) return null
      return regex.test(value) ? null : message
    }
  },

  /**
   * Custom validator function
   */
  custom: (validatorFn, message = 'Validation failed') => {
    return (value) => {
      try {
        return validatorFn(value) ? null : message
      } catch (e) {
        console.error('[Validators] custom error:', e)
        return message
      }
    }
  },

  /**
   * XSS detection - check for dangerous patterns
   */
  noXSS: (value, message = 'Invalid characters detected') => {
    if (!value) return null

    // Dangerous patterns
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick=, onerror=, etc
      /<iframe/i,
      /eval\(/i,
      /expression\(/i
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        return message
      }
    }

    return null
  },

  /**
   * SQL injection detection
   */
  noSQLi: (value, message = 'Invalid input detected') => {
    if (!value) return null

    const sqliPatterns = [
      /('|(--)|;|\/\*|\*\/|xp_|sp_)/i,
      /union.*select/i,
      /insert.*into/i,
      /delete.*from/i,
      /drop.*table/i,
      /update.*set/i
    ]

    for (const pattern of sqliPatterns) {
      if (pattern.test(value)) {
        return message
      }
    }

    return null
  },

  /**
   * Match another field (password confirmation, etc)
   */
  matches: (otherValue, message = 'Fields do not match') => {
    return (value) => {
      if (!value) return null
      return value === otherValue ? null : message
    }
  },

  /**
   * SSN format (XXX-XX-XXXX)
   */
  ssn: (value, message = 'Invalid SSN format') => {
    if (!value) return null
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/
    return ssnRegex.test(value) ? null : message
  },

  /**
   * Zip code (5 digits)
   */
  zipcode: (value, message = 'Invalid zip code') => {
    if (!value) return null
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(value) ? null : message
  },

  /**
   * Numeric only
   */
  numeric: (value, message = 'Must be a number') => {
    if (!value) return null
    return /^\d+$/.test(value.toString()) ? null : message
  },

  /**
   * Alphanumeric only
   */
  alphanumeric: (value, message = 'Only letters and numbers allowed') => {
    if (!value) return null
    return /^[a-zA-Z0-9]+$/.test(value) ? null : message
  }
}

/**
 * Combinador de validadores
 * Ejecuta múltiples validadores en secuencia, retorna primer error
 */
function combineValidators(...validators) {
  return (value) => {
    for (const validator of validators) {
      const error = typeof validator === 'function' ? validator(value) : null
      if (error) return error
    }
    return null
  }
}

window.Validators = Validators
window.combineValidators = combineValidators
