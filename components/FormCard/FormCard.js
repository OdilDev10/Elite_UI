/**
 * FormCard Component
 * Contact form with validation and submit handling
 */

class FormCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: 'Contact Form',
            subtitle: 'Send us a message',
            formSubmitted: false,
            ...props
        })
        this._props = { onSubmit: null, ...props }
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('FormCard')
    }

    handleSubmit(e) {
        e.preventDefault()
        const form = e.currentTarget
        const formData = {
            name: form.querySelector('[name="name"]').value,
            email: form.querySelector('[name="email"]').value,
            message: form.querySelector('[name="message"]').value
        }
        this.setState({ formSubmitted: true })
        form.reset()
        this._props.onSubmit?.(formData)
        setTimeout(() => this.setState({ formSubmitted: false }), 3000)
    }
}

window.FormCard = FormCard