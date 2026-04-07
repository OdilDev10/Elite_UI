/**
 * ValidatorsTab Component
 * Documentación de validadores
 */

class ValidatorsTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('ValidatorsTab')
    }
}

window.ValidatorsTab = ValidatorsTab
