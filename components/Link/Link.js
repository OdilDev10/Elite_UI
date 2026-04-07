/**
 * Link Component
 * Link que navega sin reload usando el router global ($router)
 *
 * Props:
 * - label: texto visible del link
 * - href: ruta a navegar (ej: '/users/123')
 * - variant: 'primary' | 'secondary' (default: 'primary')
 * - className: clases CSS adicionales (default: '')
 * - onClick: callback adicional antes de navegar (opcional)
 */

class Link extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {})
        this._props = {
            label: 'Link',
            href: '/',
            variant: 'primary',
            className: '',
            onClick: null,
            ...props
        }
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('Link', {
            href: this._props.href,
            label: this._props.label,
            variant: this._props.variant,
            className: this._props.className
        })
    }

    onMount() {
        this.on('click', 'a', async (e) => {
            e.preventDefault()

            // Callback adicional (opcional)
            if (this._props.onClick) {
                await this._props.onClick()
            }

            // Navegar usando router global
            if (window.$router?.navigate) {
                window.$router.navigate(this._props.href)
            } else {
                console.warn('[Link] Router not available, falling back to href')
                window.location.href = this._props.href
            }
        })
    }
}

window.Link = Link
