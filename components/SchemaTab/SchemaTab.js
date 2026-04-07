/**
 * SchemaTab Component
 * Documentación de validación con $schema (mini Zod)
 */

class SchemaTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('SchemaTab')
    }
}

window.SchemaTab = SchemaTab
