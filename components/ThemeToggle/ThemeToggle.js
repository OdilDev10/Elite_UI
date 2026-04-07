/**
 * ThemeToggle Component
 * Toggles between light and dark theme
 * Stores preference in localStorage
 */

class ThemeToggle extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector)
        this._props = {
            onToggle: null,
            ...props
        }
    }

    onMount() {
        this.applyTheme(this.getCurrentTheme())
    }

    setupEventListeners() {
        this.on('click', '.theme-toggle', () => this.toggle())
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('ThemeToggle')
        this.setupEventListeners()
    }

    getCurrentTheme() {
        const saved = localStorage.getItem('elite-theme')
        if (saved) return saved
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('elite-theme', theme)
        this.applyTheme(theme)
        this._props.onToggle?.(theme)
    }

    toggle() {
        const current = this.getCurrentTheme()
        this.setTheme(current === 'dark' ? 'light' : 'dark')
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
        const btn = this.el.querySelector('.theme-toggle')
        if (btn) {
            btn.setAttribute('data-theme', theme)
        }
    }
}

window.ThemeToggle = ThemeToggle
