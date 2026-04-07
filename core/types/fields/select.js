/**
 * Select-based field configurations
 */

export const selectField = (name, label, options = [], options2 = {}) => ({
    type: 'select',
    name,
    label,
    placeholder: options2.placeholder || 'Seleccionar...',
    hint: options2.hint || '',
    required: options2.required || false,
    disabled: options2.disabled || false,
    className: options2.className || '',
    options,
})

export const searchSelectField = (name, label, options = [], options2 = {}) => ({
    type: 'search-select',
    name,
    label,
    placeholder: options2.placeholder || 'Buscar...',
    hint: options2.hint || '',
    required: options2.required || false,
    disabled: options2.disabled || false,
    className: options2.className || '',
    options,
    searchLimit: options2.searchLimit || 10,
})

export const multiSelectField = (name, label, options = [], options2 = {}) => ({
    type: 'multi-select',
    name,
    label,
    placeholder: options2.placeholder || 'Seleccionar...',
    hint: options2.hint || '',
    required: options2.required || false,
    disabled: options2.disabled || false,
    className: options2.className || '',
    options,
    pageSize: options2.pageSize || 5,
})

export const countrySelectField = (name, label, options2 = {}) => ({
    type: 'country-select',
    name,
    label,
    placeholder: options2.placeholder || 'País...',
    hint: options2.hint || '',
    required: options2.required || false,
    disabled: options2.disabled || false,
    className: options2.className || '',
})
