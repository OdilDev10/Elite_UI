/**
 * Link Component
 * Navigation link with SPA support
 */

class Link extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            label: 'Link',
            href: '/',
            variant: 'primary',
            ...props
        })
        this._props = { onClick: null, ...props }
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('Link')
    }

    handleClick(e) {
        e.preventDefault()
        this._props.onClick?.()
        if (window.$router?.navigate) {
            window.$router.navigate(this.state.href)
        }
    }
}

window.Link = Link