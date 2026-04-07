/**
 * Type Interfaces (JSDoc)
 * 
 * These are documentation/reference interfaces.
 * In vanilla JS, we use JSDoc comments for type hints.
 * 
 * @typedef is used to define custom types
 */

/**
 * @typedef {Object} IFieldConfig
 * @property {string} type - Field type: text, email, password, select, search-select, multi-select, country-select, phone, dni, date, duration-step, switch, checkbox, textarea, currency, custom
 * @property {string} name - Field name (used in form data)
 * @property {string} label - Display label
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [hint] - Help text below field
 * @property {boolean} [required] - Is field required
 * @property {boolean} [disabled] - Is field disabled
 * @property {string} [className] - Additional CSS classes
 * @property {Array<{value: string, label: string}>} [options] - Options for select fields
 */

/**
 * @typedef {Object} ISmartFormProps
 * @property {IFieldConfig[]} fields - Array of field configurations
 * @property {Function} onSubmit - Submit handler function
 * @property {Object} [validationSchema] - Zod/MiniZod schema for validation
 * @property {Function} [zodResolver] - Custom resolver function
 * @property {string} [submitLabel] - Submit button label
 * @property {string} [className] - Additional form CSS classes
 * @property {1|2|3} [gridCols] - Grid columns (1, 2, or 3)
 * @property {boolean} [hideSubmit] - Hide submit button
 * @property {string} [formId] - Custom form ID
 * @property {Object} [initialValues] - Initial form values
 */

/**
 * @typedef {Object} IFormState
 * @property {Object} values - Current form values
 * @property {Object} errors - Validation errors
 * @property {Object} touched - Fields that have been interacted with
 * @property {boolean} isSubmitting - Is form currently submitting
 */

/**
 * @typedef {Object} IValidationResult
 * @property {boolean} error - Whether validation failed
 * @property {*} data - Validated data (or null if error)
 * @property {string[]} errors - Array of error messages
 */

/**
 * @typedef {Object} ISchema
 * @property {string} _type - Schema type (string, number, boolean, array, object, enum)
 * @property {Object} _opts - Schema options
 * @property {Array} _rules - Validation rules
 * @property {Function} min - Minimum length/value rule
 * @property {Function} max - Maximum length/value rule
 * @property {Function} pattern - Regex pattern rule
 * @property {Function} email - Email format validation
 * @property {Function} url - URL format validation
 * @property {Function} required - Mark as required
 * @property {Function} optional - Mark as optional
 * @property {Function} default - Set default value
 * @property {Function} parse - Validate and parse data
 */
