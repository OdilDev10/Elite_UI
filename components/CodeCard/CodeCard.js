/**
 * CodeCard Component
 * Displays filename and code with syntax highlighting
 */

class CodeCard extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            filename: 'code.js',
            code: '// Your code here',
            ...props
        })
    }

    render() {
        if (!this.el) return
        this.el.className = 'col-span-full bg-zinc-900 text-white rounded-xl p-5'
        this.el.innerHTML = this.loadTemplate('CodeCard')
    }
}

window.CodeCard = CodeCard