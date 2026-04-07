/**
 * Text-based field configurations
 */

export const textField = (name, label, options = {}) => ({
    type: 'text',
    name,
    label,
    placeholder: options.placeholder || '',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    readonly: options.readonly || false,
    className: options.className || '',
    minlength: options.minlength,
    maxlength: options.maxlength,
    pattern: options.pattern,
})

export const emailField = (name, label, options = {}) => ({
    type: 'email',
    name,
    label,
    placeholder: options.placeholder || 'email@example.com',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
})

export const passwordField = (name, label, options = {}) => ({
    type: 'password',
    name,
    label,
    placeholder: options.placeholder || '••••••••',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    minlength: options.minlength || 8,
    pattern: options.pattern,
})

export const numberField = (name, label, options = {}) => ({
    type: 'number',
    name,
    label,
    placeholder: options.placeholder || '',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    min: options.min,
    max: options.max,
    step: options.step || 1,
})
