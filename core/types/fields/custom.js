/**
 * Custom field configuration
 */

export const customField = (name, label, component, options = {}) => ({
    type: 'custom',
    name,
    label,
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    component,
})
