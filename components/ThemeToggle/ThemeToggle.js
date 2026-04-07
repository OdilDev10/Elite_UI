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
        const isDark = this.state.theme === 'dark'
        document.documentElement.setAttribute('data-theme', this.state.theme)
        document.documentElement.classList.toggle('dark', isDark)
        this.el.innerHTML = this.loadTemplate('component-theme-toggle')
    }

    onMount() {
        this._renderButtons()
    }

    _renderButtons() {
        const outlet = this.el.querySelector('[data-outlet="buttons"]')
        if (!outlet || !this._state.buttons) return
        
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

    toggle() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark'
        this.setState({ theme: newTheme })
        localStorage.setItem('elite-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        
        // Add/remove 'dark' class for Tailwind
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
        
        // Also update CSS variables as fallback
        document.documentElement.style.setProperty('--bg', newTheme === 'dark' ? '#09090b' : '#fafafa')
        document.documentElement.style.setProperty('--text', newTheme === 'dark' ? '#fafafa' : '#27272a')
        document.documentElement.style.setProperty('--text-muted', newTheme === 'dark' ? '#a1a1aa' : '#71717a')
        document.documentElement.style.setProperty('--border', newTheme === 'dark' ? '#27272a' : '#f1f1f4')
        document.documentElement.style.setProperty('--card-bg', newTheme === 'dark' ? '#18181b' : '#ffffff')
        
        this._props.onToggle?.(newTheme)
    }
}

window.ThemeToggle = ThemeToggle