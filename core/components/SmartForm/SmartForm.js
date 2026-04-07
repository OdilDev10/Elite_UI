/**
 * SmartForm Component
 * 
 * Dynamic form that renders fields based on IFieldConfig array.
 * Supports validation with $schema (MiniZod).
 * 
 * @example
 * const fields = [
 *   textField('name', 'Nombre', { required: true }),
 *   emailField('email', 'Email', { required: true }),
 *   passwordField('password', 'Contraseña', { required: true }),
 *   selectField('role', 'Rol', [
 *     { value: 'user', label: 'Usuario' },
 *     { value: 'admin', label: 'Administrador' }
 *   ], { required: true }),
 * ]
 * 
 * const form = new SmartForm('#form-container', {
 *   fields,
 *   validationSchema: $schema({
 *     name: $string().required(),
 *     email: $string().email().required(),
 *     password: $string().min(8).required(),
 *     role: $enum('user', 'admin').required(),
 *   }),
 *   onSubmit: (data) => console.log('Submitted:', data),
 *   gridCols: 2,
 * })
 * 
 * form.mount()
 */

class SmartForm extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            values: {},
            errors: {},
            touched: {},
            isSubmitting: false,
            ...props
        })

        this._props = {
            fields: [],
            onSubmit: () => {},
            validationSchema: null,
            zodResolver: null,
            submitLabel: 'Submit',
            gridCols: 1,
            hideSubmit: false,
            formId: null,
            initialValues: {},
            className: '',
            ...props
        }

        this._generatedFormId = `sf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }

    get formId() {
        return this._props.formId || this._generatedFormId
    }

    render() {
        if (!this.el) return

        const { fields, submitLabel, gridCols, hideSubmit, className } = this._props
        const { values, errors, touched, isSubmitting } = this._state

        const gridClass = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-3',
        }[gridCols] || 'grid-cols-1'

        const fieldsHtml = fields.map(field => this._renderField(field, values, errors, touched)).join('')

        const submitBtn = hideSubmit ? '' : `
            <div class="flex justify-end pt-4">
                <button 
                    type="submit" 
                    class="w-full sm:w-auto h-12 px-10 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 transition-all hover:shadow-2xl hover:shadow-brand-primary/30 disabled:opacity-60 disabled:cursor-not-allowed bg-brand-primary text-white hover:bg-brand-primary/90"
                    ${isSubmitting ? 'disabled' : ''}
                >
                    ${isSubmitting ? '<i class="bi bi-arrow-repeat spin mr-2"></i>' : ''}
                    ${this._escapeHtml(submitLabel)}
                </button>
            </div>
        `

        this.el.innerHTML = `
            <form id="${this.formId}" class="space-y-8 ${className}" novalidate>
                <div class="grid gap-6 ${gridClass}">
                    ${fieldsHtml}
                </div>
                ${submitBtn}
            </form>
        `

        this._attachEventListeners()
    }

    _renderField(field, values, errors, touched) {
        const value = values[field.name] ?? ''
        const error = errors[field.name]
        const isTouched = touched[field.name]
        const hasError = isTouched && error

        const errorHtml = hasError 
            ? `<p class="text-danger text-[10px] mt-1.5 ml-1 font-bold uppercase tracking-widest">${this._escapeHtml(error)}</p>`
            : ''

        const requiredMark = field.required 
            ? '<span class="text-danger ml-0.5">*</span>' 
            : ''

        const disabledAttr = field.disabled ? 'disabled' : ''
        const readonlyAttr = field.readonly ? 'readonly' : ''

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
                return this._renderInput(field, value, errorHtml, requiredMark, disabledAttr, readonlyAttr)

            case 'textarea':
                return this._renderTextarea(field, value, errorHtml, requiredMark, disabledAttr)

            case 'select':
                return this._renderSelect(field, value, errorHtml, requiredMark, disabledAttr)

            case 'search-select':
                return this._renderSearchSelect(field, value, errorHtml, requiredMark, disabledAttr)

            case 'multi-select':
                return this._renderMultiSelect(field, value, errorHtml, requiredMark, disabledAttr)

            case 'country-select':
                return this._renderCountrySelect(field, value, errorHtml, requiredMark, disabledAttr)

            case 'phone':
                return this._renderPhone(field, value, errorHtml, requiredMark, disabledAttr)

            case 'dni':
                return this._renderDni(field, value, errorHtml, requiredMark, disabledAttr)

            case 'date':
                return this._renderDate(field, value, errorHtml, requiredMark, disabledAttr)

            case 'duration-step':
                return this._renderDuration(field, value, errorHtml, requiredMark, disabledAttr)

            case 'switch':
                return this._renderSwitch(field, value, errorHtml, requiredMark, disabledAttr)

            case 'checkbox':
                return this._renderCheckbox(field, value, errorHtml, requiredMark, disabledAttr)

            case 'currency':
                return this._renderCurrency(field, value, errorHtml, requiredMark, disabledAttr)

            case 'custom':
                return this._renderCustom(field)

            default:
                return this._renderInput(field, value, errorHtml, requiredMark, disabledAttr, readonlyAttr)
        }
    }

    _renderInput(field, value, errorHtml, requiredMark, disabledAttr, readonlyAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const stepAttr = field.step ? `step="${field.step}"` : ''
        const minAttr = field.min !== undefined ? `min="${field.min}"` : ''
        const maxAttr = field.max !== undefined ? `max="${field.max}"` : ''
        const minLengthAttr = field.minlength ? `minlength="${field.minlength}"` : ''
        const maxLengthAttr = field.maxlength ? `maxlength="${field.maxlength}"` : ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <input 
                    type="${field.type}" 
                    id="${field.name}" 
                    name="${field.name}" 
                    value="${this._escapeHtml(value)}"
                    placeholder="${this._escapeHtml(field.placeholder || '')}"
                    class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                    ${disabledAttr} ${readonlyAttr} ${stepAttr} ${minAttr} ${maxAttr} ${minLengthAttr} ${maxLengthAttr}
                />
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderTextarea(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const rowsAttr = field.rows ? `rows="${field.rows}"` : 'rows="3"'
        const minLengthAttr = field.minlength ? `minlength="${field.minlength}"` : ''
        const maxLengthAttr = field.maxlength ? `maxlength="${field.maxlength}"` : ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <textarea 
                    id="${field.name}" 
                    name="${field.name}" 
                    placeholder="${this._escapeHtml(field.placeholder || '')}"
                    class="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                    ${disabledAttr} ${rowsAttr} ${minLengthAttr} ${maxLengthAttr}
                >${this._escapeHtml(value)}</textarea>
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderSelect(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const optionsHtml = field.options?.map(opt => 
            `<option value="${this._escapeHtml(opt.value)}" ${opt.value === value ? 'selected' : ''}>${this._escapeHtml(opt.label)}</option>`
        ).join('') || ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <select 
                    id="${field.name}" 
                    name="${field.name}" 
                    class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                    ${disabledAttr}
                >
                    <option value="">${this._escapeHtml(field.placeholder || 'Seleccionar...')}</option>
                    ${optionsHtml}
                </select>
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderSearchSelect(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const optionsHtml = field.options?.map(opt => 
            `<option value="${this._escapeHtml(opt.value)}" ${opt.value === value ? 'selected' : ''}>${this._escapeHtml(opt.label)}</option>`
        ).join('') || ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="${field.name}" 
                        name="${field.name}"
                        list="${field.name}-list"
                        value="${this._escapeHtml(value)}"
                        placeholder="${this._escapeHtml(field.placeholder || 'Buscar...')}"
                        class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                        ${disabledAttr}
                    />
                    <datalist id="${field.name}-list">
                        ${optionsHtml}
                    </datalist>
                    <i class="bi bi-search absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"></i>
                </div>
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderMultiSelect(field, value, errorHtml, requiredMark, disabledAttr) {
        const selectedValues = Array.isArray(value) ? value : []
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''

        return `
            <div class="space-y-2">
                <label class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <div class="space-y-1">
                    ${field.options?.map(opt => `
                        <label class="flex items-center gap-3 p-3 rounded-lg border border-input hover:bg-accent cursor-pointer transition-colors">
                            <input 
                                type="checkbox" 
                                name="${field.name}" 
                                value="${this._escapeHtml(opt.value)}"
                                ${selectedValues.includes(opt.value) ? 'checked' : ''}
                                class="w-4 h-4 rounded border-input text-brand-primary focus:ring-brand-primary"
                                ${disabledAttr}
                            />
                            <span class="text-sm">${this._escapeHtml(opt.label)}</span>
                        </label>
                    `).join('') || ''}
                </div>
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderCountrySelect(field, value, errorHtml, requiredMark, disabledAttr) {
        const countries = [
            { value: 'DO', label: 'República Dominicana' },
            { value: 'US', label: 'Estados Unidos' },
            { value: 'ES', label: 'España' },
            { value: 'MX', label: 'México' },
            { value: 'CO', label: 'Colombia' },
            { value: 'AR', label: 'Argentina' },
        ]
        const optionsHtml = countries.map(opt => 
            `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join('')

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <select 
                    id="${field.name}" 
                    name="${field.name}" 
                    class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                    ${disabledAttr}
                >
                    <option value="">${this._escapeHtml(field.placeholder || 'País...')}</option>
                    ${optionsHtml}
                </select>
                ${errorHtml}
            </div>
        `
    }

    _renderPhone(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <input 
                    type="tel" 
                    id="${field.name}" 
                    name="${field.name}" 
                    value="${this._escapeHtml(value)}"
                    placeholder="${this._escapeHtml(field.placeholder || '+1 (809) 555-5555')}"
                    class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                    ${disabledAttr}
                />
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderDni(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <input 
                    type="text" 
                    id="${field.name}" 
                    name="${field.name}" 
                    value="${this._escapeHtml(value)}"
                    placeholder="${this._escapeHtml(field.placeholder || '000-0000000-0')}"
                    class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider ${field.className || ''}"
                    ${disabledAttr}
                />
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderDate(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const minAttr = field.min ? `min="${field.min}"` : ''
        const maxAttr = field.max ? `max="${field.max}"` : ''

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <input 
                    type="date" 
                    id="${field.name}" 
                    name="${field.name}" 
                    value="${this._escapeHtml(value)}"
                    class="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                    ${disabledAttr} ${minAttr} ${maxAttr}
                />
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderDuration(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const step = field.durationStep || 15
        const hours = Math.floor((value || 0) / 60)
        const minutes = (value || 0) % 60

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <div class="flex gap-2 items-center">
                    <select 
                        name="${field.name}-hours" 
                        class="flex-1 h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                        ${disabledAttr}
                        onchange="this.form['${field.name}'].value = (parseInt(this.value) * 60) + (parseInt(this.form['${field.name}-minutes'].value) || 0)"
                    >
                        ${Array.from({length: 24}, (_, i) => `<option value="${i}" ${i === hours ? 'selected' : ''}>${i}h</option>`).join('')}
                    </select>
                    <select 
                        name="${field.name}-minutes" 
                        class="flex-1 h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                        ${disabledAttr}
                        onchange="this.form['${field.name}'].value = (parseInt(this.form['${field.name}-hours'].value) * 60) + parseInt(this.value)"
                    >
                        ${Array.from({length: 60/step}, (_, i) => `<option value="${i * step}" ${i * step === minutes ? 'selected' : ''}>${i * step}m</option>`).join('')}
                    </select>
                    <input type="hidden" name="${field.name}" value="${value || 0}" />
                </div>
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderSwitch(field, value, errorHtml, requiredMark, disabledAttr) {
        const checked = value ? 'checked' : ''
        const isOn = value ? 'bg-brand-primary' : 'bg-input'

        return `
            <div class="flex items-center justify-between py-4 px-4 rounded-xl border border-input bg-card">
                <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold text-foreground">${this._escapeHtml(field.label)}${requiredMark}</span>
                    ${field.hint ? `<span class="text-xs text-muted-foreground">${this._escapeHtml(field.hint)}</span>` : ''}
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        name="${field.name}" 
                        value="true" 
                        class="sr-only peer"
                        ${checked} ${disabledAttr}
                        onchange="this.previousElementSibling.textContent = this.checked ? 'Sí' : 'No'"
                    />
                    <div class="w-11 h-6 ${isOn} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary transition-colors"></div>
                </label>
                ${errorHtml}
            </div>
        `
    }

    _renderCheckbox(field, value, errorHtml, requiredMark, disabledAttr) {
        const checked = value ? 'checked' : ''

        return `
            <div class="flex items-center gap-3 py-4 px-4 rounded-xl border border-input bg-card">
                <input 
                    type="checkbox" 
                    id="${field.name}" 
                    name="${field.name}" 
                    value="true" 
                    class="w-4 h-4 rounded border-input text-brand-primary focus:ring-brand-primary"
                    ${checked} ${disabledAttr}
                />
                <label for="${field.name}" class="text-sm font-semibold text-foreground cursor-pointer">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                ${errorHtml}
            </div>
        `
    }

    _renderCurrency(field, value, errorHtml, requiredMark, disabledAttr) {
        const hintHtml = field.hint ? `<p class="text-muted-foreground text-xs mt-1">${this._escapeHtml(field.hint)}</p>` : ''
        const currency = field.currency || 'DOP'
        const stepAttr = field.step ? `step="${field.step}"` : 'step="0.01"'
        const minAttr = field.min !== undefined ? `min="${field.min}"` : 'min="0"'

        return `
            <div class="space-y-2">
                <label for="${field.name}" class="block text-sm font-semibold text-foreground">
                    ${this._escapeHtml(field.label)}${requiredMark}
                </label>
                <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-primary">${currency}</span>
                    <input 
                        type="number" 
                        id="${field.name}" 
                        name="${field.name}" 
                        value="${value || ''}"
                        placeholder="0.00"
                        class="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${field.className || ''}"
                        ${disabledAttr} ${stepAttr} ${minAttr}
                    />
                </div>
                ${hintHtml}
                ${errorHtml}
            </div>
        `
    }

    _renderCustom(field) {
        if (typeof field.component === 'function') {
            return field.component(field)
        }
        return `
            <div class="space-y-2">
                <label class="block text-sm font-semibold text-foreground">${this._escapeHtml(field.label)}</label>
                <div class="p-4 border border-dashed border-input rounded-xl text-muted-foreground text-sm">
                    Custom field: ${this._escapeHtml(field.name)}
                </div>
            </div>
        `
    }

    _attachEventListeners() {
        const form = document.getElementById(this.formId)
        if (!form) return

        const { fields, onSubmit, validationSchema, zodResolver } = this._props

        form.addEventListener('submit', async (e) => {
            e.preventDefault()

            const formData = new FormData(form)
            const values = {}

            for (const [key, val] of formData.entries()) {
                if (key.endsWith('-hours') || key.endsWith('-minutes')) continue
                values[key] = val
            }

            for (const field of fields) {
                if (field.type === 'multi-select') {
                    values[field.name] = formData.getAll(field.name)
                }
                if (field.type === 'duration-step') {
                    const hours = parseInt(formData.get(`${field.name}-hours`) || '0')
                    const minutes = parseInt(formData.get(`${field.name}-minutes`) || '0')
                    values[field.name] = hours * 60 + minutes
                }
            }

            this.setState({ values })

            let errors = {}

            if (validationSchema) {
                const result = validationSchema.parse(values)
                if (result.error) {
                    result.errors.forEach(err => {
                        const [fieldName, ...rest] = err.split(': ')
                        if (fieldName && rest.length) {
                            errors[fieldName.trim()] = rest.join(': ').trim()
                        } else {
                            errors._general = err
                        }
                    })
                }
            }

            if (zodResolver) {
                const zodErrors = zodResolver(validationSchema)(values)
                if (zodErrors && typeof zodErrors === 'object') {
                    errors = { ...errors, ...zodErrors }
                }
            }

            const allTouched = {}
            fields.forEach(f => { allTouched[f.name] = true })
            this.setState({ errors, touched: allTouched })

            if (Object.keys(errors).length === 0) {
                this.setState({ isSubmitting: true })
                try {
                    await onSubmit(values)
                } finally {
                    this.setState({ isSubmitting: false })
                }
            }
        })

        fields.forEach(field => {
            const el = form.querySelector(`[name="${field.name}"]`)
            if (!el) return

            el.addEventListener('input', (e) => {
                const values = { ...this._state.values }
                if (field.type === 'multi-select') {
                    values[field.name] = formData.getAll(field.name)
                } else {
                    values[field.name] = e.target.value
                }
                this.setState({ values })
            })

            el.addEventListener('blur', () => {
                const touched = { ...this._state.touched }
                touched[field.name] = true

                let errors = { ...this._state.errors }

                if (validationSchema && field.name) {
                    const fieldSchema = validationSchema._opts?.fields?.[field.name]
                    if (fieldSchema) {
                        const result = fieldSchema.parse(values[field.name])
                        if (result.error) {
                            errors[field.name] = result.errors[0]
                        } else {
                            delete errors[field.name]
                        }
                    }
                }

                this.setState({ touched, errors })
            })
        })
    }

    handleChange(name, value) {
        const values = { ...this._state.values, [name]: value }
        this.setState({ values })
    }

    reset() {
        this.setState({
            values: {},
            errors: {},
            touched: {},
            isSubmitting: false,
        })
    }

    setErrors(errors) {
        this.setState({ errors })
    }

    mount() {
        const { initialValues } = this._props
        if (initialValues && Object.keys(initialValues).length > 0) {
            this._state.values = { ...initialValues }
        }
        super.mount()
    }
}

window.SmartForm = SmartForm
