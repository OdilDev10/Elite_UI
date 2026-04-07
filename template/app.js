/**
 * EliteUI Application Bootstrap (Template)
 * 
 * Single entry point. Loads framework, components, pages, and mounts.
 * 
 * To customize, edit this file or create component/page files.
 * Components auto-load from components/index.js registry.
 */

(function() {
    'use strict'

    const CONFIG = {
        framework: 'dist/elite-ui.min.js',
        components: 'components/index.js',
        pages: 'pages/index.js'
    }

    function loadScript(src) {
        return new Promise((resolve) => {
            const existing = document.querySelector(`script[src="${src}"]`)
            if (existing) {
                resolve()
                return
            }
            const script = document.createElement('script')
            script.src = src
            script.onload = resolve
            script.onerror = resolve
            document.head.appendChild(script)
        })
    }

    function waitFor(name, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now()
            function check() {
                if (window[name]) {
                    resolve()
                    return
                }
                if (Date.now() - start > timeout) {
                    reject(new Error(`Timeout: ${name}`))
                    return
                }
                setTimeout(check, 50)
            }
            check()
        })
    }

    async function mountComponents() {
        const registry = window.__eliteComponents || {}
        for (const name of Object.keys(registry)) {
            if (window[name]) continue
            await loadScript(`components/${name}/${name}.js`)
        }
    }

    async function bootstrap() {
        console.log('[App] Starting...')

        // 1. Framework
        if (!window.EliteUI) {
            await loadScript(CONFIG.framework)
            await waitFor('EliteUI', 5000)
        }

        // 2. Components
        await loadScript(CONFIG.components)
        await mountComponents()

        // 3. Pages
        await loadScript(CONFIG.pages)

        // 4. Theme
        const savedTheme = localStorage.getItem('elite-theme')
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark')
        }

        // 5. Mount components based on DOM
        if (window.ThemeToggle && document.querySelector('#component-theme-toggle')) {
            new ThemeToggle('#component-theme-toggle', { theme: savedTheme || 'light' }).mount()
        }

        if (window.HomePage && document.querySelector('#page-home')) {
            new HomePage('#page-home', {
                title: 'Welcome to EliteUI',
                subtitle: 'Start building your app by editing components/'
            }).mount()
        }

        window.dispatchEvent(new CustomEvent('App:ready'))
        console.log('[App] Ready!')
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap)
    } else {
        bootstrap()
    }

    window.App = { bootstrap, CONFIG }
})()
