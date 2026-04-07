/**
 * Main Layout
 * Default layout with header and footer
 */

class MainLayout extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: 'My App',
            ...props
        })
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = `
            <header class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
                <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="#/" class="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <span class="w-2.5 h-2.5 bg-green-600 rounded"></span>
                        <span data-text="title"></span>
                    </a>
                    <div id="component-theme-toggle"></div>
                </div>
            </header>
            
            <main id="app-main">
                <!-- Page content goes here -->
            </main>
            
            <footer class="border-t border-zinc-200 dark:border-zinc-800 mt-16">
                <div class="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-zinc-500">
                    <p>© 2026 My App</p>
                    <div class="flex gap-6">
                        <a href="#" class="hover:text-green-600 transition-colors">Privacy</a>
                        <a href="#" class="hover:text-green-600 transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        `
    }

    onMount() {
        // Mount theme toggle if element exists
        const themeToggleEl = this.el.querySelector('#component-theme-toggle')
        if (themeToggleEl && window.ThemeToggle) {
            const savedTheme = localStorage.getItem('elite-theme')
            const themeToggle = new ThemeToggle('#component-theme-toggle', {
                theme: savedTheme || 'light'
            })
            themeToggle.mount()
        }
    }
}

window.MainLayout = MainLayout
