/**
 * EliteUI Application Bootstrap
 * 
 * Single entry point. Loads framework, components, and mounts everything.
 * Uses nested components pattern: <hero-component>, <feature-card>, etc.
 */

(function() {
    'use strict'

    const CONFIG = {
        framework: 'dist/elite-ui.min.js',
        components: 'components/index.js'
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
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

    async function bootstrap() {
        console.log('[App] Starting...')

        // 1. Load framework bundle
        if (!window.EliteUI) {
            await loadScript(CONFIG.framework)
            await waitFor('EliteUI', 5000)
        }

        // 2. Load component registry and all components
        await loadScript(CONFIG.components)
        
        // Load all registered components
        const registry = window.__eliteComponents || {}
        for (const name of Object.keys(registry)) {
            await loadScript(`components/${name}/${name}.js`)
        }

        // 3. Load pages (HomePage)
        await loadScript('pages/home/HomePage.js')

        // 4. Apply theme
        const savedTheme = localStorage.getItem('elite-theme')
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark')
        }

        // 5. Mount ThemeToggle
        if (window.ThemeToggle) {
            const toggle = new ThemeToggle('#component-theme-toggle', {
                theme: savedTheme || 'light'
            })
            toggle.mount()
        }

        // 6. Mount HomePage (composes all child components via nested components)
        if (window.HomePage) {
            const home = new HomePage('#app-home', {})
            home.mount()
        }

        // 7. Dispatch ready
        window.dispatchEvent(new CustomEvent('App:ready'))
        console.log('[App] Ready!')
    }

    // Auto-start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap)
    } else {
        bootstrap()
    }

    window.App = { bootstrap, CONFIG }
})()