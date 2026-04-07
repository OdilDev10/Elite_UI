/**
 * Special field configurations
 */

export const textareaField = (name, label, options = {}) => ({
    type: 'textarea',
    name,
    label,
    placeholder: options.placeholder || '',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    rows: options.rows || 3,
    minlength: options.minlength,
    maxlength: options.maxlength,
})

export const currencyField = (name, label, options = {}) => ({
    type: 'currency',
    name,
    label,
    placeholder: options.placeholder || '0.00',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    currency: options.currency || 'DOP',
    min: options.min || 0,
    max: options.max,
    step: options.step || 0.01,
})
