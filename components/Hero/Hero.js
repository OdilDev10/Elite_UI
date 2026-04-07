/**
 * Hero Component
 * Uses data-* directives for reactivity
 */

class Hero extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: props.title || 'Vanilla JS Framework',
            subtitle: props.subtitle || 'Zero dependencies. Security first. Production ready infrastructure for modern web apps.',
            buttons: props.buttons || [],
            ...props
        })
        this._props = { ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('Hero')
    }

    onMount() {
        this._renderButtons()
    }

    _renderButtons() {
        const outlet = this.el.querySelector('[data-outlet="buttons"]')
        if (!outlet) return
        
        outlet.innerHTML = ''
        this._state.buttons.forEach(btn => {
            const a = document.createElement('a')
            a.href = btn.href
            a.target = btn.target || '_self'
            a.className = `px-6 py-3 rounded-lg font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg ${btn.variant === 'secondary' ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100' : 'bg-green-600 hover:bg-green-700 text-white'}`
            a.textContent = btn.label
            outlet.appendChild(a)
        })
    }
}

window.Hero = Hero