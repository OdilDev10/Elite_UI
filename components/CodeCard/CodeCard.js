/**
 * CodeCard Component
 * Renders syntax-highlighted code with filename header
 */

class CodeCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector)
        this._props = {
            filename: 'code.js',
            code: '// Your code here',
            ...props
        }
    }

    async render() {
        if (!this.el) return

        this.el.className = 'bento-card code-card'
        this.el.innerHTML = await this.loadTemplate('CodeCard', {
            filename: this._props.filename,
            code: this._props.code
        })
    }
}

window.CodeCard = CodeCard
