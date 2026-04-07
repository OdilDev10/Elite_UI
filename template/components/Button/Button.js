/**
 * Button Component
 * Uses data-* directives for label and variants
 */

class Button extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            label: 'Button',
            variant: 'primary',
            ...props
        })
        this._props = { onClick: null, ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('Button')
    }

    handleClick(e) {
        e.preventDefault()
        this._props.onClick?.(e)
    }
}

window.Button = Button
