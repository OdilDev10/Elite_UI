/**
 * HomePage Component
 * Composes all child components using nested component pattern
 * Usage: <home-page> in HTML auto-resolves <hero-component>, <feature-card>, <counter-component>
 */

class HomePage extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            ...props
        })
    }

    render() {
        if (!this.el) {
            console.warn('[HomePage] Element not found:', this.el)
            return
        }
        console.log('[HomePage] Rendering template: app-home')
        const html = this.loadTemplate('app-home')
        console.log('[HomePage] Template HTML length:', html.length)
        this.el.innerHTML = html
    }

    onMount() {
        console.log('[HomePage] Mounted, children should be resolved now')
    }
}

window.HomePage = HomePage