# Sistema de Directivas Data-* - EliteUI

## Regla Principal

**NO usar `{{}}`** - Solo directivas `data-*`. Son HTML estándar.

---

## Directivas Soportadas

### Contenido

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-text="key"` | Escribe texto seguro (XSS-safe) | `<span data-text="count"></span>` |
| `data-html="key"` | Renderiza HTML (usar con precaución) | `<div data-html="content"></div>` |

### Visibilidad

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-if="expr"` | Muestra/oculta con display:none | `<div data-if="isOpen">...</div>` |
| `data-show="expr"` | Muestra/oculta con visibility | `<div data-show="isVisible">...</div>` |

### Binding (Inputs)

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-bind="key"` | Two-way binding | `<input data-bind="email" />` |
| `data-value="key"` | Value solo lectura | `<input data-value="message" />` |
| `data-checked="expr"` | Para checkboxes | `<input type="checkbox" data-checked="isActive" />` |

### Atributos

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-disabled="expr"` | Desactiva elemento | `<button data-disabled="isBusy">Send</button>` |
| `data-placeholder="key"` | Placeholder dinámico | `<input data-placeholder="hint" />` |
| `data-title="key"` | Atributo title | `<button data-title="tooltip">Hover</button>` |
| `data-href="key"` | href dinámico | `<a data-href="url">Link</a>` |
| `data-src="key"` | src dinámico | `<img data-src="imageUrl" />` |
| `data-attr-*-="expr"` | Atributo genérico | `<div data-attr-aria-label="label"></div>` |

### Clases

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-class-X="expr"` | Toggle clase X | `<button data-class-active="isActive">...</button>` |
| `data-style-X="expr"` | Estilo dinámico | `<div data-style-color="color"></div>` |

### Eventos

| Directiva | Evento | Ejemplo |
|-----------|--------|---------|
| `data-onclick="method"` | click | `<button data-onclick="increment">+</button>` |
| `data-onchange="method"` | change | `<select data-onchange="updateSort"></select>` |
| `data-oninput="method"` | input | `<input data-oninput="handleInput" />` |
| `data-onkeyup="method"` | keyup | `<input data-onkeyup="search" />` |
| `data-onkeydown="method"` | keydown | `<input data-onkeydown="handleKey" />` |
| `data-onfocus="method"` | focus | `<input data-onfocus="onFocus" />` |
| `data-onblur="method"` | blur | `<input data-onblur="onBlur" />` |
| `data-onsubmit="method"` | submit | `<form data-onsubmit="handleSubmit"></form>` |

### Permisos

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-permission="perm"` | Oculta sin permiso | `<button data-permission="users.delete">Delete</button>` |
| `data-role="role"` | Oculta sin rol | `<div data-role="admin">Admin Panel</div>` |

### Layout

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-outlet="name"` | Contenedor hijos | `<div data-outlet="sidebar"></div>` |

### Navegación

| Directiva | Comportamiento | Ejemplo |
|-----------|----------------|---------|
| `data-link="/path"` | Navega sin reload | `<a data-link="/">Home</a>` |

---

## Ejemplos de Uso

### Contenido

```html
<span data-text="message"></span>
<div data-html="richContent"></div>
```

### Visibilidad

```html
<div data-if="isOpen">Removido del DOM si false</div>
<div data-show="isLoading">Oculto con visibility si false</div>
```

### Inputs

```html
<input data-bind="email" />
<input type="checkbox" data-checked="isAdmin" />
```

### Eventos

```html
<button data-onclick="increment">+</button>
<input data-oninput="handleSearch" />
<form data-onsubmit="submitForm"></form>
```

### Clases

```html
<button data-class-active="isActive" class="px-4 py-2">Click</button>
```

### Permisos

```html
<button data-permission="users.delete">Delete User</button>
<div data-role="admin">Solo visible para admins</div>
```

### Outlets

```html
<div data-outlet="sidebar"></div>
<main data-outlet="content"></main>
```

---

## Comparación Vue vs EliteUI

| Vue | EliteUI | Tipo |
|-----|---------|------|
| `v-if` | `data-if` | Visibility |
| `v-show` | `data-show` | Visibility |
| `{{ text }}` | `data-text` | Content |
| `v-html` | `data-html` | Content |
| `v-model` | `data-bind` | Binding |
| `v-bind:attr` | `data-attr-*` | Attributes |
| `v-bind:class` | `data-class-*` | Classes |
| `v-bind:style` | `data-style-*` | Styles |
| `@click` | `data-onclick` | Events |
| `@change` | `data-onchange` | Events |
| `@input` | `data-oninput` | Events |
| `v-permission` | `data-permission` | Security |
| `<slot>` | `data-outlet` | Layout |

---

## Reglas Importantes

1. **NO usar `{{}}`** - Solo directivas `data-*`
2. **NO usar `v-*`** - Usar `data-*` (estándar HTML)
3. **NO estilos inline** - Usar clases Tailwind
4. **Usar `data-outlet`** para composición de layouts
5. **Templates inline** para compatibilidad con `file://`

---

**EliteUI: Todo declarativo, nada imperativo. 🚀**
