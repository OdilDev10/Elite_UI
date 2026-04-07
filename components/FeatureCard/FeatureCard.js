/**
 * FeatureCard Component
 * Uses data-* directives for title, description, icon
 */

class FeatureCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: 'Feature',
            description: 'Feature description',
            icon: null,
            ...props
        })
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('FeatureCard')
    }
}

window.FeatureCard = FeatureCard