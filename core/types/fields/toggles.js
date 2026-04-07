/**
 * Toggle/switch field configurations
 */

export const switchField = (name, label, options = {}) => ({
    type: 'switch',
    name,
    label,
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
})

export const checkboxField = (name, label, options = {}) => ({
    type: 'checkbox',
    name,
    label,
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
})
