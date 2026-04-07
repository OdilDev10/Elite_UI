# Validators

Security & input validation built-ins.

## Usage

```javascript
Validators.email('test@mail.com')   // null = valid
Validators.email('invalid')          // 'Invalid email' = error

Validators.required()('value')       // null
Validators.required()('')            // 'This field is required'
```

## Combine Validators

```javascript
combineValidators(
    Validators.required(),
    Validators.email(),
    Validators.noXSS()
)
```

## Format Validators

| Validator | Description |
|-----------|-------------|
| `Validators.email()` | Email format |
| `Validators.phone()` | Phone number |
| `Validators.url()` | Valid URL |
| `Validators.creditCard()` | Luhn algorithm |
| `Validators.ssn()` | XXX-XX-XXXX format |
| `Validators.zipcode()` | 5 or 5+4 digits |

## Security Validators

| Validator | Description |
|-----------|-------------|
| `Validators.noXSS()` | Detect script tags, javascript:, onclick |
| `Validators.noSQLi()` | Detect SQL injection patterns |

## Password

```javascript
Validators.password(value, {
    min: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecial: true
})
// Returns null if valid, error string if invalid
```

## Length

```javascript
Validators.minLength(2)('ab')     // null
Validators.minLength(2)('a')      // 'Minimum 2 characters'

Validators.maxLength(10)('abc')   // null
Validators.maxLength(2)('abc')   // 'Maximum 2 characters'
```

## Custom

```javascript
Validators.custom((value) => {
    return value > 0
}, 'Must be positive')
```