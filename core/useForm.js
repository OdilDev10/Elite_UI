/**
 * UseForm - Enhanced
 * Form state management con seguridad, validación y rate limiting
 *
 * Seguridad incluida:
 * - Sanitización automática
 * - Validadores de XSS/SQLi
 * - Rate limiting en submit
 * - CSRF token support
 * - Password strength meter
 *
 * Uso:
 * const form = component.useForm({
 *   email: {
 *     value: '',
 *     validate: [Validators.email],
 *     secure: true  // Auto-sanitize
 *   },
 *   password: {
 *     value: '',
 *     validate: [Validators.password({ min: 8 })],
 *     secure: true
 *   }
 * })
 *
 * form.bind('email', 'input[name="email"]')
 * form.bind('password', 'input[name="password"]')
 * form.onSubmit(handler)
 * form.submit()
 */

class UseForm {
  constructor(schema = {}, component = null, options = {}) {
    this.schema = schema
    this.component = component
    this.values = this._initValues()
    this.errors = {}
    this.touched = {}
    this.dirty = {}
    this.validators = this._extractValidators()
    this.secureFields = this._extractSecureFields()
    this.bindings = new Map()
    this.submitHandler = null
    this.isSubmitting = false

    // Security options
    this.csrfToken = options.csrfToken || null
    this.rateLimitMs = options.rateLimitMs || 2000
    this.lastSubmitTime = 0

    // Password strength tracking
    this.passwordStrength = {}
  }

  /**
   * Initialize values from schema
   */
  _initValues() {
    const values = {}
    for (const [key, field] of Object.entries(this.schema)) {
      values[key] = field.value !== undefined ? field.value : ''
    }
    return values
  }

  /**
   * Extract validators from schema
   */
  _extractValidators() {
    const validators = {}
    for (const [key, field] of Object.entries(this.schema)) {
      if (Array.isArray(field.validate)) {
        validators[key] = field.validate
      }
    }
    return validators
  }

  /**
   * Extract secure fields that need sanitization
   */
  _extractSecureFields() {
    const secure = {}
    for (const [key, field] of Object.entries(this.schema)) {
      if (field.secure === true) {
        secure[key] = true
      }
    }
    return secure
  }

  /**
   * Sanitize value if field is marked secure
   */
  _sanitizeIfNeeded(fieldName, value) {
    if (!this.secureFields[fieldName] || !value) {
      return value
    }

    // Sanitizar: escapar HTML
    const el = document.createElement('div')
    el.textContent = value
    return el.innerHTML
  }

  /**
   * Validate single field
   */
  validateField(name, value = null) {
    const val = value !== null ? value : this.values[name]
    const validators = this.validators[name]

    if (!validators || !Array.isArray(validators)) {
      return null
    }

    for (const validator of validators) {
      try {
        let error = null

        // Si validator es función normal
        if (typeof validator === 'function') {
          error = validator(val)
        }

        if (error) return error
      } catch (e) {
        console.error(`[useForm] validator error for ${name}:`, e)
        return 'Validation error'
      }
    }

    return null
  }

  /**
   * Validate all fields
   */
  validate() {
    const errors = {}
    let isValid = true

    for (const name of Object.keys(this.values)) {
      const error = this.validateField(name)
      if (error) {
        errors[name] = error
        isValid = false
      }
    }

    this.errors = errors
    return { isValid, errors }
  }

  /**
   * Set field value with automatic sanitization
   */
  setValue(name, value) {
    // Sanitizar si es necesario
    const sanitizedValue = this._sanitizeIfNeeded(name, value)
    this.values[name] = sanitizedValue
    this.dirty[name] = true

    // Calcular password strength si es contraseña
    if (name.toLowerCase().includes('password')) {
      this.passwordStrength[name] = this._calculatePasswordStrength(sanitizedValue)
    }

    // Auto-validate if already touched
    if (this.touched[name]) {
      const error = this.validateField(name, sanitizedValue)
      this.errors[name] = error
    }

    // Update component state
    if (this.component) {
      this.component.setState({
        formValues: this.values,
        formErrors: this.errors,
        formTouched: this.touched,
        formDirty: this.dirty,
        passwordStrength: this.passwordStrength
      })
    }
  }

  /**
   * Set field as touched
   */
  setTouched(name) {
    this.touched[name] = true

    // Validate on touch
    const error = this.validateField(name)
    this.errors[name] = error

    if (this.component) {
      this.component.setState({
        formErrors: this.errors,
        formTouched: this.touched
      })
    }
  }

  /**
   * Reset form
   */
  reset() {
    this.values = this._initValues()
    this.errors = {}
    this.touched = {}
    this.dirty = {}
    this.isSubmitting = false
    this.passwordStrength = {}

    if (this.component) {
      this.component.setState({
        formValues: this.values,
        formErrors: this.errors,
        formTouched: this.touched,
        formDirty: this.dirty,
        passwordStrength: this.passwordStrength
      })
    }

    // Reset input elements
    this.bindings.forEach((selector) => {
      const el = document.querySelector(selector)
      if (el) el.value = ''
    })
  }

  /**
   * Calculate password strength (0-100)
   */
  _calculatePasswordStrength(password) {
    if (!password) return 0

    let strength = 0

    // Length
    if (password.length >= 8) strength += 20
    if (password.length >= 12) strength += 10

    // Uppercase
    if (/[A-Z]/.test(password)) strength += 20

    // Numbers
    if (/\d/.test(password)) strength += 20

    // Special characters
    if (/[!@#$%^&*]/.test(password)) strength += 30

    return Math.min(strength, 100)
  }

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel(fieldName) {
    const strength = this.passwordStrength[fieldName] || 0

    if (strength < 30) return 'Weak'
    if (strength < 60) return 'Fair'
    if (strength < 80) return 'Good'
    return 'Strong'
  }

  /**
   * Bind field to input element with mask and sanitization
   */
  bind(fieldName, selector, options = {}) {
    const el = document.querySelector(selector)
    if (!el) {
      console.warn(`[useForm] element not found: ${selector}`)
      return
    }

    const mask = options.mask || null
    const sanitize = this.secureFields[fieldName] || options.sanitize || false

    this.bindings.set(fieldName, selector)

    // Set initial value
    let initialValue = this.values[fieldName] || ''
    if (mask) {
      initialValue = mask(initialValue)
    }
    el.value = initialValue

    // Input event: update value
    el.addEventListener('input', (e) => {
      let value = e.target.value

      // Apply mask if provided
      if (mask) {
        value = mask(value)
        e.target.value = value
      }

      this.setValue(fieldName, value)
    })

    // Blur event: mark as touched
    el.addEventListener('blur', () => {
      this.setTouched(fieldName)
    })

    // Change event (for selects, checkboxes)
    el.addEventListener('change', (e) => {
      if (el.type === 'checkbox') {
        this.setValue(fieldName, e.target.checked)
      } else if (el.type === 'radio') {
        this.setValue(fieldName, e.target.value)
      }
      this.setTouched(fieldName)
    })
  }

  /**
   * Get field error
   */
  getError(name) {
    return this.errors[name] || null
  }

  /**
   * Check if field has error
   */
  hasError(name) {
    return !!this.errors[name]
  }

  /**
   * Check if field is touched
   */
  isTouched(name) {
    return !!this.touched[name]
  }

  /**
   * Check if field is dirty (modified)
   */
  isDirty(name) {
    return !!this.dirty[name]
  }

  /**
   * Get all form values (deep copy)
   */
  getValues() {
    return JSON.parse(JSON.stringify(this.values))
  }

  /**
   * Check if form is valid
   */
  isValid() {
    return this.validate().isValid
  }

  /**
   * Check if form is dirty
   */
  isDirty() {
    return Object.values(this.dirty).some(v => v)
  }

  /**
   * On submit handler
   */
  onSubmit(handler) {
    this.submitHandler = handler
    return this
  }

  /**
   * Check rate limiting
   */
  _checkRateLimit() {
    const now = Date.now()
    if (now - this.lastSubmitTime < this.rateLimitMs) {
      return false
    }
    this.lastSubmitTime = now
    return true
  }

  /**
   * Prepare payload with optional CSRF token
   */
  _preparePayload(values) {
    const payload = { ...values }

    // Add CSRF token if configured
    if (this.csrfToken) {
      payload._csrf = this.csrfToken
    }

    return payload
  }

  /**
   * Handle form submission
   */
  async submit(e) {
    if (e) {
      e.preventDefault()
    }

    if (!this.submitHandler) {
      console.warn('[useForm] no submit handler set')
      return
    }

    // Check rate limiting
    if (!this._checkRateLimit()) {
      console.warn('[useForm] submit rate limited')
      const error = `Please wait ${Math.ceil((this.rateLimitMs - (Date.now() - this.lastSubmitTime)) / 1000)}s before trying again`
      this.errors._form = error
      if (this.component) {
        this.component.setState({ formError: error })
      }
      return
    }

    const { isValid } = this.validate()
    if (!isValid) {
      console.log('[useForm] validation failed')
      return false
    }

    this.isSubmitting = true

    if (this.component) {
      this.component.setState({ formSubmitting: true })
    }

    try {
      const payload = this._preparePayload(this.getValues())
      const result = await this.submitHandler(payload)
      this.isSubmitting = false
      return result
    } catch (error) {
      console.error('[useForm] submit error:', error)
      this.isSubmitting = false
      throw error
    } finally {
      if (this.component) {
        this.component.setState({ formSubmitting: false })
      }
    }
  }

  /**
   * Set CSRF token for form
   */
  setCsrfToken(token) {
    this.csrfToken = token
    return this
  }

  /**
   * Get CSRF token
   */
  getCsrfToken() {
    return this.csrfToken
  }

  /**
   * Debug: print form state
   */
  debug() {
    console.group('[useForm] Debug')
    console.log('Values:', this.getValues())
    console.log('Errors:', this.errors)
    console.log('Touched:', this.touched)
    console.log('Dirty:', this.dirty)
    console.log('Password Strength:', this.passwordStrength)
    console.log('IsValid:', this.isValid())
    console.log('IsDirty:', this.isDirty())
    console.log('IsSubmitting:', this.isSubmitting)
    console.log('CSRF Token:', this.csrfToken ? '✓ Set' : '✗ Not set')
    console.groupEnd()
  }
}

/**
 * Agregar useForm como método en SimpleComponent
 */
if (typeof SimpleComponent !== 'undefined') {
  SimpleComponent.prototype.useForm = function(schema, options = {}) {
    if (!this._useFormInstance) {
      this._useFormInstance = new UseForm(schema, this, options)
    }
    return this._useFormInstance
  }
}

window.UseForm = UseForm
