/**
 * Button Component
 * Reusable button with primary/secondary variant
 */

class Button extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {})
        this._props = {
            label: 'Button',
            href: '#',
            variant: 'primary',
            target: null,
            onClick: null,
            ...props
        }
    }

    onMount() {
        this.setupEventListeners()
    }

    setupEventListeners() {
        const btn = this.el.querySelector('a, button')
        if (btn && this._props.onClick) {
            btn.addEventListener('click', this._props.onClick)
        }
    }

    render() {
        if (!this.el) return

        const { label, href, variant, target } = this._props
        const isLink = href && href !== '#'

        const tag = isLink ? 'a' : 'button'
        const attrs = isLink
            ? `href="${href}" ${target ? `target="${target}"` : ''}`
            : 'type="button"'

        this.el.innerHTML = `
            <${tag}
                class="hero-btn hero-btn-${variant}"
                ${attrs}
            >
                ${label}
            </${tag}>
        `

        this.setupEventListeners()
    }
}

window.Button = Button
