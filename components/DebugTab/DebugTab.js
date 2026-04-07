/**
 * DebugTab Component
 * Documentación de herramientas de debug
 */

class DebugTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('DebugTab')
    }
}

window.DebugTab = DebugTab
