/**
 * Button Component
 * Simple button component (para links, usar Link.js)
 *
 * Props:
 * - label: texto del botón
 * - variant: 'primary' | 'secondary' (default: 'primary')
 * - onClick: callback cuando se hace click (opcional)
 */

class Button extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {})
        this._props = {
            label: 'Button',
            variant: 'primary',
            onClick: null,
            ...props
        }
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('Button', {
            variant: this._props.variant,
            label: this._props.label
        })
    }

    onMount() {
        // Si tiene callback onClick, registrar listener
        if (this._props.onClick) {
            this.on('click', 'button', this._props.onClick)
        }
    }
}

window.Button = Button
