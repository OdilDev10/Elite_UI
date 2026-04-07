# $schema - Mini Zod

Mini Zod for runtime data validation. Zero dependencies, works with `file://` protocol.

## Quick Start

```javascript
const UserSchema = $schema({
    name: $string().min(2).max(100).required(),
    email: $string().email().required(),
    age: $number().min(0).max(150).optional(),
    role: $enum('admin', 'user', 'guest'),
    tags: $array($string()),
    address: $object({
        street: $string(),
        city: $string()
    }).optional()
})

const result = UserSchema.parse({
    name: 'Juan',
    email: 'juan@example.com',
    role: 'user'
})

if (result.error) {
    console.log('Validation failed:', result.errors)
} else {
    console.log('Valid!', result.data)
}
```

## Result Object

```javascript
{
    error: false,      // true if validation failed
    data: {...},       // validated data (or null if error)
    errors: []         // array of error messages
}
```

## Available Types

| Constructor | Description | Example |
|-------------|-------------|---------|
| `$string()` | String validation | `$string().email()` |
| `$number()` | Number validation | `$number().min(0).max(150)` |
| `$boolean()` | Boolean validation | `$boolean()` |
| `$array(schema)` | Array with item schema | `$array($string())` |
| `$object({})` | Object with field schemas | `$object({ name: $string() })` |
| `$enum(...)` | One of specified values | `$enum('admin', 'user')` |

## String Rules

```javascript
$string().min(2)                           // Minimum length
$string().max(50)                          // Maximum length
$string().email()                          // Valid email format
$string().url()                            // Valid URL format
$string().pattern(/^[a-z]+$/)             // Custom regex
$string().pattern(/[A-Z]/, 'Must have uppercase') // Custom error message
$string().required('Name is required')     // Cannot be empty/undefined
$string().optional()                       // Can be undefined
$string().default('value')                 // Default if undefined
```

## Number Rules

```javascript
$number().min(0)                // Minimum value
$number().max(150)             // Maximum value
$number().required()           // Cannot be undefined
$number().optional()           // Can be undefined
$number().default(0)           // Default value
```

## Boolean Rules

```javascript
$boolean()                     // Basic boolean
$boolean().default(true)       // Default value
```

## Array Rules

```javascript
$array($string())              // Array of strings
$array($number())             // Array of numbers
$array($object({               // Array of objects
    id: $string(),
    name: $string()
}))
```

## Object Rules

```javascript
$object({
    name: $string(),
    email: $string().email(),
    profile: $object({
        age: $number(),
        bio: $string().optional()
    }).optional()
})
```

## Enum

```javascript
$enum('admin', 'user', 'guest')              // Must be one of these
$enum('pending', 'active', 'inactive')         // Status values
$enum('javascript', 'typescript', 'rust')     // Language options
```

## Combining Schemas

```javascript
const BaseSchema = $schema({
    id: $string(),
    createdAt: $string()
})

const UserSchema = $schema({
    name: $string().required(),
    email: $string().email().required()
})

// Merge schemas
const FullUserSchema = $schema.merge(BaseSchema, UserSchema)
```

## Safe Parse (no throws)

```javascript
const result = $schema.safeParse(UserSchema, data)

// Or use the shorthand
const result = $safeParse(UserSchema, data)
```

## Validation Flow

```
parse(value)
    ↓
1. Check if undefined/null
   ↓ optional? → return default
   ↓ required? → return error
    ↓
2. Type check
   ↓ wrong type? → return error
    ↓
3. Run rules (min, max, pattern, email, etc)
   ↓ failed rule? → add error message
    ↓
4. For objects: validate nested fields
   ↓ failed nested? → add error with field path
    ↓
5. Return { error: false, data, errors: [] }
   or { error: true, data: null, errors: [...] }
```

## Real-World Examples

### Login Form

```javascript
const LoginSchema = $schema({
    email: $string().email().required('Email es requerido'),
    password: $string().required('Contraseña es requerida'),
    rememberMe: $boolean().default(false)
})
```

### Registration Form

```javascript
const RegisterSchema = $schema({
    name: $string().min(2).max(100).required('Nombre es requerido'),
    email: $string().email().required('Email es requerido'),
    password: $string().min(8).pattern(/[A-Z]/, 'Debe tener mayúscula').required('Contraseña es requerida'),
    confirmPassword: $string().required('Confirmar contraseña es requerido'),
    termsAccepted: $boolean().required('Debes aceptar los términos')
})
```

### CodeGen Project

```javascript
const ProjectSchema = $schema({
    projectName: $string()
        .min(3).max(50)
        .pattern(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones')
        .required('Nombre del proyecto es requerido'),
    description: $string().max(500).optional(),
    language: $enum('javascript', 'typescript', 'python', 'rust', 'go', 'java')
        .required('Lenguaje es requerido'),
    database: $enum('postgresql', 'mysql', 'sqlite', 'mongodb', 'none').optional(),
    features: $array($string()).optional(),
    authRequired: $boolean().default(true)
})
```

## Error Messages

Default error messages:

| Rule | Default Message |
|------|----------------|
| `required()` | "Required" |
| `min(length)` | "Minimum {length} characters" |
| `max(length)` | "Maximum {length} characters" |
| `min(value)` | "Minimum {value}" |
| `max(value)` | "Maximum {value}" |
| `email()` | "Invalid email" |
| `url()` | "Invalid URL" |
| `pattern()` | "Invalid format" |
| `enum()` | "Must be one of: {values}" |

Custom messages:

```javascript
$string().required('Este campo es obligatorio')
$number().min(0, 'El valor debe ser positivo')
$enum('admin', 'user').required('Selecciona un rol')
```

## Framework Integration

Use with SmartForm component:

```javascript
import { SmartForm } from './components/SmartForm/SmartForm.js'
import { $schema, $string, $number, $enum } from './core/Schema.js'
import { textField, emailField, selectField } from './types/fields/index.js'

const fields = [
    textField('name', 'Nombre', { required: true }),
    emailField('email', 'Email', { required: true }),
    selectField('role', 'Rol', [
        { value: 'user', label: 'Usuario' },
        { value: 'admin', label: 'Administrador' }
    ], { required: true })
]

const form = new SmartForm('#form-container', {
    fields,
    validationSchema: $schema({
        name: $string().required(),
        email: $string().email().required(),
        role: $enum('user', 'admin').required()
    }),
    onSubmit: (data) => console.log('Submitted:', data)
})

form.mount()
```
