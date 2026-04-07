# Variables de Entorno - $env

## Overview

El sistema `$env` permite acceder a variables de entorno configuradas desde el HTML, sin necesidad de bundlers como Vite.

## Configuración en HTML

### Opción 1: Meta Tag

```html
<head>
    <meta name="env" 
          data-api-url="https://api.example.com" 
          data-api-key="abc123"
          data-timeout="5000">
</head>
```

### Opción 2: Script Inline

```html
<head>
    <script type="env/config">
        {
            "API_URL": "https://api.example.com",
            "API_KEY": "abc123"
        }
    </script>
</head>
```

### Opción 3: window.ENV

```javascript
// Antes de cargar el script del framework
window.ENV = {
    API_URL: 'https://api.example.com',
    API_KEY: 'abc123'
}
```

---

## Uso en JavaScript

```javascript
// Obtener variable
$env.get('API_URL')           // 'https://api.example.com'
$env.get('API_KEY')            // 'abc123'

// Con valor por defecto
$env.get('UNKNOWN', 'default')  // 'default'

// Verificar si existe
$env.has('API_URL')           // true

// Obtener todas
$env.all()                    // { API_URL: '...', API_KEY: '...' }
```

---

## Uso en API Client

```javascript
// api.js - API Service
class ApiService extends HttpClient {
    constructor() {
        super({
            baseUrl: $env.get('API_URL', 'https://jsonplaceholder.typicode.com'),
            timeout: parseInt($env.get('TIMEOUT', '30000'))
        })
    }
}
```

---

## Ejemplo .env.example

```bash
# API Configuration
API_URL=https://jsonplaceholder.typicode.com
API_TIMEOUT=30000

# Auth
AUTH_TOKEN=your_token_here

# App
APP_NAME=MyEliteApp
DEBUG=false
```

---

## Conversión de Nombres

Los atributos en meta tags se convierten automáticamente:

| Meta Data Attribute | Variable Name |
|--------------------|---------------|
| `data-api-url` | `API_URL` |
| `data-api-key` | `API_KEY` |
| `data-timeout` | `TIMEOUT` |

El formato kebab-case se convierte a UPPER_SNAKE_CASE.

---

## Seguridad

⚠️ **Nota**: Las variables de entorno en el cliente son visibles para el usuario. No expongas secrets sensibles en el frontend.

Para datos sensibles, considera:
- Usar headers del servidor
- Proxies de API
- Tokens de sesión en lugar de API keys estáticas

---

## API Reference

| Método | Descripción |
|--------|-------------|
| `get(key, defaultValue)` | Obtiene variable con default |
| `has(key)` | Verifica si existe |
| `all()` | Obtiene todas las variables |

---

**$env: Configuración simple sin bundlers. ⚙️**
