/**
 * ThemeToggle Component
 * Toggles between light and dark theme using data-* directives
 */

class ThemeToggle extends SimpleComponent {
    constructor(selector, props = {}) {
        const savedTheme = localStorage.getItem('elite-theme')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        
        super(selector, {
            theme: props.theme || savedTheme || (systemDark ? 'dark' : 'light'),
            ...props
        })
        this._props = { onToggle: null, ...props }
    }

    render() {
        if (!this.el) return
        document.documentElement.setAttribute('data-theme', this.state.theme)
        this.el.innerHTML = this.loadTemplate('component-theme-toggle')
    }

    toggle() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark'
        this.setState({ theme: newTheme })
        localStorage.setItem('elite-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        this._props.onToggle?.(newTheme)
    }
}

window.ThemeToggle = ThemeToggle
