/**
 * Types Module - EliteUI
 * 
 * Provides field configuration helpers for SmartForm.
 * 
 * @example
 * const fields = [
 *   textField('name', 'Nombre', { required: true }),
 *   emailField('email', 'Email', { required: true }),
 * ]
 */

export { textField, emailField, passwordField, numberField } from './fields/text.js'
export { selectField, searchSelectField, multiSelectField, countrySelectField } from './fields/select.js'
export { phoneField, dniField } from './fields/idFields.js'
export { dateField, durationField } from './fields/dateFields.js'
export { switchField, checkboxField } from './fields/toggles.js'
export { textareaField, currencyField } from './fields/special.js'
export { customField } from './fields/custom.js'
export { createField } from './fields/factory.js'
