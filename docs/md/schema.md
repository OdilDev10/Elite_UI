# $schema

Mini Zod for data validation.

## Define Schema

```javascript
const UserSchema = $schema({
    name: $string().min(2).max(50).required(),
    email: $string().email(),
    age: $number().min(0).max(150).optional(),
    role: $enum('admin', 'user', 'guest'),
    tags: $array($string()),
    address: $object({
        street: $string(),
        city: $string()
    }).optional()
})
```

## Parse Data

```javascript
const result = UserSchema.parse({
    name: 'Juan',
    email: 'juan@example.com',
    role: 'user'
})

if (result.error) {
    console.log('Errors:', result.errors)
    // ['name must be at least 2 characters', 'email is required']
} else {
    console.log('Valid!', result.data)
}
```

## Available Types

| Type | Description |
|------|-------------|
| `$string()` | String validation |
| `$number()` | Number validation |
| `$boolean()` | Boolean validation |
| `$array(schema)` | Array with item schema |
| `$object({})` | Object with field schemas |
| `$enum(...)` | One of specified values |

## String Rules

```javascript
$string().min(2)              // Minimum length
$string().max(50)             // Maximum length
$string().email()             // Valid email format
$string().url()               // Valid URL format
$string().pattern(/regex/)     // Custom regex
$string().required()          // Cannot be empty
$string().optional()           // Can be undefined
$string().default('value')     // Default value
```

## Number Rules

```javascript
$number().min(0)               // Minimum value
$number().max(150)            // Maximum value
$number().required()           // Cannot be undefined
$number().optional()           // Can be undefined
```