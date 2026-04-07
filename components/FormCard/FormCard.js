/**
 * FormCard Component
 * Contact form con validación y manejo de envío
 * Usa directivas data-text, data-show, data-class para mostrar/ocultar respuesta
 *
 * Props:
 * - title: título del formulario
 * - subtitle: subtítulo
 * - onSubmit: callback cuando se envía el formulario
 *
 * Estado interno:
 * - title, subtitle: desde props
 * - formSubmitted: boolean para mostrar/ocultar respuesta (data-show)
 * - submitSuccess: boolean para clase de éxito (data-class-success)
 */

class FormCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: props.title || 'Contact Form',
            subtitle: props.subtitle || 'Send us a message',
            formSubmitted: false,
            submitSuccess: false
        })
        this._props = {
            onSubmit: null,
            ...props
        }
    }

    async render() {
        if (!this.el) return
        this.el.className = 'bento-card form-card'
        this.el.innerHTML = await this.loadTemplate('FormCard')
    }

    onMount() {
        const form = this.el.querySelector('#contact-form')

        this.on('submit', '#contact-form', (e) => {
            e.preventDefault()

            // Recopilar datos del formulario
            const formData = {
                name: form.querySelector('[name="name"]').value,
                email: form.querySelector('[name="email"]').value,
                message: form.querySelector('[name="message"]').value
            }

            // Actualizar estado para mostrar mensaje (data-show se activa)
            this.setState({
                formSubmitted: true,
                submitSuccess: true
            })

            // Resetear formulario
            form.reset()

            // Callback al padre
            this._props.onSubmit?.(formData)

            // Ocultar respuesta después de 3 segundos
            setTimeout(() => {
                this.setState({ formSubmitted: false })
            }, 3000)
        })
    }
}

window.FormCard = FormCard
