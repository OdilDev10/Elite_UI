/**
 * Date and duration field configurations
 */

export const dateField = (name, label, options = {}) => ({
    type: 'date',
    name,
    label,
    placeholder: options.placeholder || '',
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    min: options.min,
    max: options.max,
})

export const durationField = (name, label, options = {}) => ({
    type: 'duration-step',
    name,
    label,
    hint: options.hint || '',
    required: options.required || false,
    disabled: options.disabled || false,
    className: options.className || '',
    durationStep: options.durationStep || 15,
    min: options.min || 0,
    max: options.max || 480,
})
