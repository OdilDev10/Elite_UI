/**
 * $schema - Mini Zod para validación de schemas
 * 
 * Uso:
 * 
 * const UserSchema = $schema({
 *   name: $string().min(2).max(50),
 *   email: $string().email(),
 *   age: $number().min(0).max(150),
 *   password: $string().min(8).pattern(/[A-Z]/, 'must have uppercase'),
 *   isActive: $boolean(),
 *   tags: $array($string()),
 *   address: $object({
 *     street: $string(),
 *     city: $string()
 *   }).optional()
 * })
 * 
 * const result = UserSchema.parse({
 *   name: 'Juan',
 *   email: 'juan@example.com',
 *   age: 25
 * })
 * 
 * if (result.error) {
 *   console.log('Validation failed:', result.errors)
 * } else {
 *   console.log('Valid!', result.data)
 * }
 */

// Tipos base
const $string = (defaultValue = '') => createSchema('string', { default: defaultValue })
const $number = (defaultValue = 0) => createSchema('number', { default: defaultValue })
const $boolean = (defaultValue = false) => createSchema('boolean', { default: defaultValue })
const $array = (schema) => createSchema('array', { schema })
const $object = (fields) => createSchema('object', { fields })
const $enum = (...values) => createSchema('enum', { values })
const $optional = (schema) => createSchema(schema._type, { ...schema._opts, optional: true })

function createSchema(type, opts = {}) {
  const schema = {
    _type: type,
    _opts: opts,
    _rules: [],

    // String/Number rules
    min(len) {
      this._rules.push({ test: 'min', value: len, message: `Minimum ${len} characters` })
      return this
    },
    max(len) {
      this._rules.push({ test: 'max', value: len, message: `Maximum ${len} characters` })
      return this
    },
    pattern(regex, message = 'Invalid format') {
      this._rules.push({ test: 'pattern', value: regex, message })
      return this
    },
    email(message = 'Invalid email') {
      this._rules.push({ test: 'email', message })
      return this
    },
    url(message = 'Invalid URL') {
      this._rules.push({ test: 'url', message })
      return this
    },
    required(message = 'Required') {
      this._opts.requiredMessage = message
      return this
    },
    optional() {
      this._opts.optional = true
      return this
    },
    default(value) {
      this._opts.default = value
      return this
    },

    // Validate
    parse(value) {
      return validate(value, this)
    },

    // Shorthand for common
    minLength: function(len) { return this.min(len) },
    maxLength: function(len) { return this.max(len) }
  }

  return schema
}

// Validación principal
function validate(value, schema) {
  const errors = []

  // Check optional
  if (value === undefined || value === null) {
    if (schema._opts.optional) {
      return { error: false, data: schema._opts.default ?? null, errors: [] }
    }
    if (schema._opts.default !== undefined) {
      return { error: false, data: schema._opts.default, errors: [] }
    }
    return { error: true, data: null, errors: [schema._opts.requiredMessage || 'Required'] }
  }

  // Type validation
  if (schema._type === 'string' && typeof value !== 'string') {
    return { error: true, data: null, errors: ['Expected string'] }
  }

  if (schema._type === 'number' && typeof value !== 'number') {
    return { error: true, data: null, errors: ['Expected number'] }
  }

  if (schema._type === 'boolean' && typeof value !== 'boolean') {
    return { error: true, data: null, errors: ['Expected boolean'] }
  }

  if (schema._type === 'array' && !Array.isArray(value)) {
    return { error: true, data: null, errors: ['Expected array'] }
  }

  if (schema._type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
    return { error: true, data: null, errors: ['Expected object'] }
  }

  if (schema._type === 'enum') {
    if (!schema._opts.values.includes(value)) {
      return { error: true, data: null, errors: [`Must be one of: ${schema._opts.values.join(', ')}`] }
    }
    return { error: false, data: value, errors: [] }
  }

  // String rules
  if (schema._type === 'string') {
    for (const rule of schema._rules) {
      if (rule.test === 'min' && value.length < rule.value) {
        errors.push(rule.message || `Minimum ${rule.value} characters`)
      }
      if (rule.test === 'max' && value.length > rule.value) {
        errors.push(rule.message || `Maximum ${rule.value} characters`)
      }
      if (rule.test === 'pattern' && !rule.value.test(value)) {
        errors.push(rule.message)
      }
      if (rule.test === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) errors.push(rule.message)
      }
      if (rule.test === 'url') {
        try { new URL(value) } catch { errors.push(rule.message) }
      }
    }
  }

  // Number rules
  if (schema._type === 'number') {
    for (const rule of schema._rules) {
      if (rule.test === 'min' && value < rule.value) {
        errors.push(rule.message || `Minimum ${rule.value}`)
      }
      if (rule.test === 'max' && value > rule.value) {
        errors.push(rule.message || `Maximum ${rule.value}`)
      }
    }
  }

  // Array rules
  if (schema._type === 'array' && schema._opts.schema) {
    for (let i = 0; i < value.length; i++) {
      const itemResult = validate(value[i], schema._opts.schema)
      if (itemResult.error) {
        errors.push(`[${i}]: ${itemResult.errors.join(', ')}`)
      }
    }
  }

  // Object rules
  if (schema._type === 'object' && schema._opts.fields) {
    for (const [key, fieldSchema] of Object.entries(schema._opts.fields)) {
      const result = validate(value[key], fieldSchema)
      if (result.error) {
        errors.push(`${key}: ${result.errors.join(', ')}`)
      }
    }
  }

  if (errors.length > 0) {
    return { error: true, data: null, errors }
  }

  return { error: false, data: value, errors: [] }
}

// Combinación de schemas
const $merge = (...schemas) => {
  const allFields = {}
  for (const s of schemas) {
    if (s._opts.fields) {
      Object.assign(allFields, s._opts.fields)
    }
  }
  return $object(allFields)
}

// Parseo seguro que no lanza
const $safeParse = (schema, data) => {
  try {
    return schema.parse(data)
  } catch (e) {
    return { error: true, data: null, errors: [e.message] }
  }
}

// Export
window.$schema = {
  string: $string,
  number: $number,
  boolean: $boolean,
  array: $array,
  object: $object,
  enum: $enum,
  optional: $optional,
  merge: $merge,
  safeParse: $safeParse
}

// Shorthand
window.$string = $string
window.$number = $number
window.$boolean = $boolean
window.$array = $array
window.$object = $object
window.$enum = $enum
window.$optional = $optional

console.log('[$schema] Mini Zod ready')
