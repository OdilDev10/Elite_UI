/**
 * FormCard Component
 * Contact form with validation and submission handling
 */

class FormCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector)
        this._props = {
            title: 'Contact Form',
            subtitle: 'Send us a message',
            onSubmit: null,
            ...props
        }
    }

    async render() {
        if (!this.el) return

        const { title, subtitle } = this._props

        this.el.className = 'bento-card form-card'
        this.el.innerHTML = await this.loadTemplate('FormCard', {
            title,
            subtitle
        })
    }

    onMount() {
        const form = this.el.querySelector('#contact-form')
        form.addEventListener('submit', (e) => {
            e.preventDefault()

            const response = this.el.querySelector('.form-response')
            response.textContent = 'Thanks! Form submitted securely.'
            response.className = 'form-response message show message-success'

            form.reset()

            this._props.onSubmit?.({
                name: form.querySelector('[name="name"]').value,
                email: form.querySelector('[name="email"]').value,
                message: form.querySelector('[name="message"]').value
            })
        })
    }
}

window.FormCard = FormCard
