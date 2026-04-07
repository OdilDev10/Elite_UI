/**
 * Field Factory - Create fields with less boilerplate
 */

/**
 * @typedef {Object} FieldOptions
 * @property {string} [placeholder]
 * @property {string} [hint]
 * @property {boolean} [required]
 * @property {boolean} [disabled]
 * @property {string} [className]
 */

/**
 * Create any field type with consistent API
 * @param {string} type - Field type (text, email, password, select, etc.)
 * @param {string} name - Field name
 * @param {string} label - Field label
 * @param {FieldOptions} [options] - Field options
 */
export const createField = (type, name, label, options = {}) => ({
    type,
    name,
    label,
    ...options,
})
