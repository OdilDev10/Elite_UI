# EliteUI Documentation

Framework de JavaScript vanilla con sistema de componentes reactivos basado en directivas `data-*`.

---

## 🚀 Primeros Pasos

- [Getting Started](getting-started.md) - Instalación y configuración
- [Directivas](directives.md) - Sistema de directivas data-*
- [Snippets](snippets.md) - Atajos para VS Code

---

## 📦 Core (Framework)

- [Components](components.md) - Sistema de componentes
- [Directivas](directives.md) - 18+ directivas data-*
- [Store](store.md) - State management con createStore
- [Router](router.md) - Enrutamiento con guards y layouts
- [$http](http.md) - Cliente HTTP simple
- [HttpClient](http.md#httpclient) - Cliente HTTP con interceptores
- [$debug](debug.md) - Herramientas de debug
- [SmartForm](types.md#smartform) - Formularios dinámicos con fields

---

## 🔐 Seguridad y Validación

- [Permissions](permissions.md) - Sistema de roles y permisos
- [Validators](validators.md) - Validación de datos
- [Schema](schema.md) - Mini Zod para validación de esquemas
- [Types](types.md) - Tipos, fields y schemas pre-construidos

---

## 🌍 Internacionalización

- [i18n](i18n.md) - Sistema de traducciones
- [Env](env.md) - Variables de entorno

---

## 🛠️ Servicios

- [Services](services.md) - API, Auth y Cart

---

## 📁 Estructura de Proyecto (Template)

```
my-app/
├── index.html                 # Entry point
├── .env.example              # Variables de entorno
├── css/
│   └── main.css              # Estilos globales (Tailwind)
├── components/               # Componentes reutilizables
│   ├── index.js              # Exporta todos
│   ├── Button/
│   ├── SmartForm/            # Formularios dinámicos
│   │   ├── SmartForm.js
│   │   └── SmartForm.html
│   └── ComponentName/
│       ├── ComponentName.js   # Lógica
│       └── ComponentName.html # Template
├── context/                  # Estado global
│   ├── index.js
│   └── store.js              # createStore
├── layouts/                  # Layouts de página
│   ├── index.js
│   └── MainLayout.js
├── pages/                    # Páginas
│   ├── index.js
│   └── HomePage/
│       ├── home.js
│       └── home.html
├── router/                   # Configuración de rutas
│   ├── index.js              # Routes exportadas
│   └── router.js            # Instancia EliteRouter
├── services/                 # Servicios de API
│   ├── index.js
│   ├── api.js
│   ├── auth.js
│   └── cart.js
├── types/                    # Tipos y schemas
│   ├── index.js
│   ├── interfaces.js         # JSDoc type hints
│   ├── fields/               # Field configs (IFieldConfig)
│   │   ├── text.js
│   │   ├── select.js
│   │   ├── phone.js
│   │   └── ...
│   └── schemas/              # Pre-built $schema
│       ├── user.js
│       └── common.js
└── lang/                    # Traducciones i18n
    ├── en/common.json
    └── es/common.json
```

---

## 📚 HTML Docs

- [Components](../docs/components.html)
- [Router](../docs/router.html)
- [$http](../docs/http.html)
- [Schema](../docs/schema.html)
- [Validators](../docs/validators.md)
- [$debug](../docs/debug.html)

---

## Comandos

```bash
# Crear nuevo proyecto
npm create @odineck/elite-ui my-app

# Bundling
npm run bundle

# Desarrollo
npm run dev
```

---

## Reglas del Framework

1. **HTML, JS, CSS separados** - Cada componente en su carpeta
2. **Directivas data-*** - No usar `{{}}` ni `v-*`
3. **Tailwind por defecto** - CSS scoped opcional
4. **IDs estandarizados** - `tmpl-component-name`, `tmpl-page-name`

---

**EliteUI: Vanilla JS sin dependencias. 🚀**
