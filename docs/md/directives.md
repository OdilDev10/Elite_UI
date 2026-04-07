# ✅ Sistema de Directivas Data-* - Estandar EliteUI

## 📋 Resumen

EliteUI usa **directivas data-*** para toda la manipulación del DOM y reactividad. **No se usan {{}} placeholders**. Todo es declarativo via HTML.

---

## Directivas Soportadas (18 total)

### Content & Text
| Directiva | Comportamiento | Ejemplo |
|-----------|---|---|
| `data-text="key"` | Escribe state[key] como textContent (XSS-safe) | `<span data-text="count"></span>` |
| `data-html="key"` | Renderiza HTML (⚠️ XSS risk) | `<div data-html="htmlContent"></div>` |

### Visibility & Display
| Directiva | Comportamiento | Ejemplo |
|-----------|---|---|
| `data-if="expr"` | Muestra/oculta con display:none | `<div data-if="isOpen">...</div>` |
| `data-show="expr"` | Muestra/oculta con visibility | `<div data-show="isVisible">...</div>` |

### Input Binding
| Directiva | Comportamiento | Ejemplo |
|-----------|---|---|
| `data-bind="key"` | Two-way binding (estado ↔ input) | `<input data-bind="email" />` |
| `data-value="key"` | Establece value (lectura solo) | `<input data-value="message" />` |
| `data-checked="expr"` | Para checkboxes/radios | `<input type="checkbox" data-checked="isActive" />` |

### Attributes
| Directiva | Comportamiento | Ejemplo |
|-----------|---|---|
| `data-disabled="expr"` | Desactiva elemento si expr es true | `<button data-disabled="isBusy">Send</button>` |
| `data-placeholder="key"` | Placeholder dinámico | `<input data-placeholder="hint" />` |
| `data-title="key"` | Atributo title dinámico | `<button data-title="tooltip">Hover</button>` |
| `data-href="key"` | href dinámico | `<a data-href="url">Link</a>` |
| `data-src="key"` | src dinámico (img, iframe) | `<img data-src="imageUrl" />` |
| `data-attr-*="expr"` | Atributos genéricos | `<div data-attr-aria-label="label"></div>` |

### Styling
| Directiva | Comportamiento | Ejemplo |
|-----------|---|---|
| `data-class-X="expr"` | Toggle de clase X | `<button data-class-active="isActive">...</button>` |
| `data-style-*="expr"` | Estilos dinámicos | `<div data-style-color="color"></div>` |

### Event Listeners
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

### Outlets (Layout)
| Directiva | Comportamiento | Ejemplo |
|-----------|--------|---------|
| `data-outlet="name"` | Contenedor para componentes hijos | `<div data-outlet="sidebar"></div>` |

### Navigation
| Directiva | Comportamiento | Ejemplo |
|-----------|--------|---------|
| `data-link="/path"` | Click → navega sin reload | `<a data-link="/">Home</a>` |

---

## Ejemplos de Uso

### Content & Text
```html
<p data-text="message"></p>
<div data-html="richContent"></div>
```

### Visibility
```html
<div data-if="isOpen">Contenido removido si isOpen es false</div>
<div data-show="isLoading">Sigue ocupando espacio</div>
```

### Input Binding
```html
<input data-bind="email" />
<input type="checkbox" data-checked="isAdmin" />
```

### Event Handlers
```html
<button data-onclick="increment">+</button>
<input data-oninput="handleSearch" />
<form data-onsubmit="submitForm"></form>
```

### Classes
```html
<button data-class-active="isActive" class="px-4 py-2">Click</button>
```

### Outlets (Layout)
```html
<div data-outlet="sidebar"></div>
<main data-outlet="content"></main>
```

---

## Quick Reference

```html
<!-- Text -->
<span data-text="key"></span>
<div data-html="htmlKey"></div>

<!-- Visibility -->
<div data-if="condition"></div>
<div data-show="condition"></div>

<!-- Input -->
<input data-bind="key" />
<input type="checkbox" data-checked="condition" />

<!-- Events -->
<button data-onclick="method"></button>
<input data-oninput="method" />
<form data-onsubmit="method"></form>

<!-- Classes -->
<element data-class-active="condition"></element>

<!-- Outlets -->
<div data-outlet="name"></div>
```

---

## Comparación: Vue vs EliteUI Directives

| Vue | EliteUI | Tipo |
|-----|---------|------|
| `v-if` | `data-if` | Visibility |
| `v-show` | `data-show` | Visibility |
| `{{ text }}` | `data-text` | Content |
| `v-html` | `data-html` | Content (XSS risk) |
| `v-model` | `data-bind` | Binding |
| `v-bind:attr` | `data-attr-*` | Attributes |
| `v-bind:class` | `data-class-*` | Classes |
| `v-bind:style` | `data-style-*` | Styles |
| `@click` | `data-onclick` | Events |
| `@change` | `data-onchange` | Events |
| `@input` | `data-oninput` | Events |
| `@keyup` | `data-onkeyup` | Events |
| `@focus` | `data-onfocus` | Events |
| `<slot>` | `data-outlet` | Layout |

---

## 🎯 Reglas Importantes

1. **NO usar {{}}** - Solo directivas data-*
2. **NO usar v-*** - Usar data-* (HTML standard)
3. **NO inline styles en templates** - Usar Tailwind classes
4. **Usar data-outlet** para composición de layouts

---

**EliteUI: Todo declarativo, nada imperativo. 🚀**