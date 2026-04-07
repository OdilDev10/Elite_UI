# Types Module

Type definitions, field configurations, and schemas for dynamic form generation.

## Structure

```
types/
├── index.js           # Main exports
├── interfaces.js      # JSDoc type documentation
├── fields/            # Field configuration builders
│   ├── index.js
│   ├── text.js        # text, email, password, number
│   ├── select.js      # select, search-select, multi-select, country-select
│   ├── idFields.js    # phone, dni
│   ├── dateFields.js  # date, duration
│   ├── toggles.js     # switch, checkbox
│   ├── special.js     # textarea, currency
│   ├── custom.js      # custom component field
│   └── factory.js     # createField factory
└── schemas/          # Pre-built $schema definitions
    ├── index.js
    ├── user.js        # user, login, register schemas
    └── common.js      # pagination, filter, sort, codegen schemas
```

## Quick Start

```javascript
import { textField, emailField, selectField } from './types/fields/index.js'
import { userSchema, loginSchema } from './types/schemas/index.js'
import { SmartForm } from './components/SmartForm/SmartForm.js'

const fields = [
    textField('name', 'Nombre', { required: true }),
    emailField('email', 'Email', { required: true }),
    passwordField('password', 'Contraseña', { required: true, minlength: 8 }),
    selectField('role', 'Rol', [
        { value: 'user', label: 'Usuario' },
        { value: 'admin', label: 'Administrador' }
    ], { required: true })
]

const form = new SmartForm('#form', {
    fields,
    validationSchema: loginSchema,
    onSubmit: (data) => console.log(data)
})
```

## Field Types

### Text Fields

```javascript
import { textField, emailField, passwordField, numberField } from './types/fields/text.js'

textField('name', 'Nombre', {
    required: true,
    placeholder: 'John Doe',
    minlength: 2,
    maxlength: 100
})

emailField('email', 'Correo electrónico', {
    required: true,
    placeholder: 'you@example.com'
})

passwordField('password', 'Contraseña', {
    required: true,
    minlength: 8
})

numberField('age', 'Edad', {
    min: 0,
    max: 150,
    step: 1
})
```

### Select Fields

```javascript
import { selectField, searchSelectField, multiSelectField, countrySelectField } from './types/fields/select.js'

selectField('country', 'País', [
    { value: 'DO', label: 'República Dominicana' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'ES', label: 'España' }
], { required: true })

searchSelectField('city', 'Ciudad', [
    { value: 'santo-domingo', label: 'Santo Domingo' },
    { value: 'santiago', label: 'Santiago' }
], { searchLimit: 10 })

multiSelectField('interests', 'Intereses', [
    { value: 'coding', label: 'Programación' },
    { value: 'design', label: 'Diseño' },
    { value: 'marketing', label: 'Marketing' }
])

countrySelectField('billingCountry', 'País de facturación')
```

### ID Fields

```javascript
import { phoneField, dniField } from './types/fields/idFields.js'

phoneField('phone', 'Teléfono', {
    required: true,
    placeholder: '+1 (809) 555-5555'
})

dniField('dni', 'Cédula', {
    required: true,
    dniType: 'cedula'  // 'cedula' or 'rnc'
})
```

### Date & Duration

```javascript
import { dateField, durationField } from './types/fields/dateFields.js'

dateField('birthdate', 'Fecha de nacimiento', {
    max: '2024-01-01'
})

durationField('duration', 'Duración', {
    durationStep: 15,  // minutes
    min: 0,
    max: 480          // 8 hours
})
```

### Toggles

```javascript
import { switchField, checkboxField } from './types/fields/toggles.js'

switchField('notifications', 'Recibir notificaciones')

checkboxField('termsAccepted', 'Acepto los términos y condiciones', {
    required: true
})
```

### Special Fields

```javascript
import { textareaField, currencyField } from './types/fields/special.js'

textareaField('description', 'Descripción', {
    rows: 4,
    maxlength: 500,
    placeholder: 'Describe tu proyecto...'
})

currencyField('budget', 'Presupuesto', {
    currency: 'DOP',
    min: 0,
    step: 0.01
})
```

### Custom Fields

```javascript
import { customField } from './types/fields/custom.js'

customField('avatar', 'Avatar', (field) => {
    return `
        <div class="custom-file-upload">
            <input type="file" name="${field.name}" accept="image/*" />
            <p class="text-xs text-muted">PNG, JPG hasta 2MB</p>
        </div>
    `
})
```

## Factory

```javascript
import { createField } from './types/fields/factory.js'

// Create any field type with consistent API
createField('text', 'name', 'Nombre', {
    required: true,
    placeholder: 'John'
})

createField('select', 'status', 'Estado', {
    options: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' }
    ]
})
```

## Pre-built Schemas

```javascript
import { userSchema, loginSchema, registerSchema } from './types/schemas/user.js'
import { paginationSchema, filterSchema, sortSchema, codegenProjectSchema } from './types/schemas/common.js'

// User schema with all fields
const result = userSchema.parse({
    name: 'Juan',
    email: 'juan@example.com',
    password: 'Password123',
    role: 'user'
})

// Login form validation
const loginResult = loginSchema.parse({
    email: 'juan@example.com',
    password: 'password123'
})

// Register form validation
const registerResult = registerSchema.parse({
    name: 'Juan',
    email: 'juan@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    termsAccepted: true
})

// CodeGen project schema
const projectResult = codegenProjectSchema.parse({
    projectName: 'my-awesome-api',
    description: 'A REST API for my project',
    language: 'typescript',
    framework: 'fastify',
    database: 'postgresql',
    authRequired: true
})
```

## IFieldConfig Interface

```javascript
/**
 * @typedef {Object} IFieldConfig
 * @property {string} type - Field type
 * @property {string} name - Field name
 * @property {string} label - Display label
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [hint] - Help text
 * @property {boolean} [required] - Is required
 * @property {boolean} [disabled] - Is disabled
 * @property {string} [className] - CSS classes
 * @property {Array<{value: string, label: string}>} [options] - Select options
 */

/**
 * @typedef {Object} ISmartFormProps
 * @property {IFieldConfig[]} fields - Array of field configurations
 * @property {Function} onSubmit - Submit handler
 * @property {Object} [validationSchema] - $schema for validation
 * @property {string} [submitLabel] - Submit button text
 * @property {1|2|3} [gridCols] - Grid columns
 * @property {boolean} [hideSubmit] - Hide submit button
 * @property {string} [formId] - Custom form ID
 * @property {Object} [initialValues] - Initial form values
 */
```

## Field Type Reference

| Type | Description | Supported Options |
|------|-------------|------------------|
| `text` | Basic text input | placeholder, minlength, maxlength, pattern |
| `email` | Email input | placeholder |
| `password` | Password input | placeholder, minlength |
| `number` | Number input | min, max, step, placeholder |
| `textarea` | Multi-line text | rows, minlength, maxlength, placeholder |
| `select` | Dropdown select | options, placeholder |
| `search-select` | Searchable dropdown | options, searchLimit, placeholder |
| `multi-select` | Multiple checkboxes | options |
| `country-select` | Country dropdown | - |
| `phone` | Phone number | placeholder |
| `dni` | Dominican ID | dniType ('cedula' or 'rnc'), placeholder |
| `date` | Date picker | min, max |
| `duration-step` | Duration selector | durationStep, min, max |
| `switch` | Toggle switch | - |
| `checkbox` | Checkbox | - |
| `currency` | Currency input | currency, min, max, step |
| `custom` | Custom component | component (function) |
