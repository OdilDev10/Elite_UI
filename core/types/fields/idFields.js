/**
 * Phone and DNI/ID field configurations
 */

export const phoneField = (name, label, options = {}) => ({
    type: 'phone',
    name,
    label,
    placeholder: options.placeholder || '+1 (809) 555-5555',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
})

export const dniField = (name, label, options = {}) => ({
    type: 'dni',
    name,
    label,
    placeholder: options.placeholder || '000-0000000-0',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    dniType: options.dniType || 'cedula',
})
