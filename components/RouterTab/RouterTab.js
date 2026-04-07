/**
 * RouterTab Component
 * Documentación del router
 */

class RouterTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('RouterTab')
    }
}

window.RouterTab = RouterTab
