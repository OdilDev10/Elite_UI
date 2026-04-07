/**
 * OverviewTab Component
 * Muestra la página de inicio con stats y features
 */

class OverviewTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('OverviewTab')
    }
}

window.OverviewTab = OverviewTab
