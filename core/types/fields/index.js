/**
 * Field Type Definitions for SmartForm
 * 
 * These are the building blocks for dynamic form generation.
 * Each field returns an IFieldConfig object.
 */

export { textField, emailField, passwordField, numberField } from './text.js'
export { selectField, searchSelectField, multiSelectField, countrySelectField } from './select.js'
export { phoneField, dniField } from './idFields.js'
export { dateField, durationField } from './dateFields.js'
export { switchField, checkboxField } from './toggles.js'
export { textareaField, currencyField } from './special.js'
export { customField } from './custom.js'
export { createField } from './factory.js'
