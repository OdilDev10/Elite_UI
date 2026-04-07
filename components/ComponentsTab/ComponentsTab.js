/**
 * ComponentsTab Component
 * Muestra documentación del sistema de componentes
 */

class ComponentsTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('ComponentsTab')
    }
}

window.ComponentsTab = ComponentsTab
