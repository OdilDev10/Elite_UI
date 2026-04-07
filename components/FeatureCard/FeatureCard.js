/**
 * FeatureCard Component
 * Displays feature with optional icon and code example
 */

class FeatureCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector)
        this._props = {
            title: 'Feature',
            description: 'Feature description',
            icon: null,
            code: null,
            wide: false,
            ...props
        }
    }

    async render() {
        if (!this.el) return

        const { title, description, icon, code, wide } = this._props

        this.el.className = `bento-card feature-card${wide ? ' wide' : ''}`
        this.el.innerHTML = await this.loadTemplate('FeatureCard', {
            title,
            description,
            code: code || ''
        })

        if (icon) {
            const iconEl = this.el.querySelector('.feature-icon')
            if (iconEl) {
                iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>`
            }
        }
    }
}

window.FeatureCard = FeatureCard
