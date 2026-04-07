/**
 * EliteUI Application Bootstrap
 * 
 * Single entry point. Loads framework, components, and mounts everything.
 * No inline scripts in HTML.
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

    async function mountComponents() {
        const registry = window.__eliteComponents || {}
        const names = Object.keys(registry)

        for (const name of names) {
            if (window[name]) continue // already loaded
            await loadScript(`components/${name}/${name}.js`)
        }

        return names
    }

    async function bootstrap() {
        console.log('[App] Starting...')

        // 1. Load framework bundle
        if (!window.EliteUI) {
            await loadScript(CONFIG.framework)
            await waitFor('EliteUI', 5000)
        }

        // 2. Load component registry
        await loadScript(CONFIG.components)

        // 3. Mount all components
        const componentNames = await mountComponents()
        console.log(`[App] Loaded ${componentNames.length} components`)

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

        // 6. Mount Hero
        if (window.Hero) {
            const hero = new Hero('#component-hero', {
                title: 'Vanilla JS Framework',
                subtitle: 'Zero dependencies. Security first. Production ready infrastructure for modern web apps.',
                buttons: [
                    { label: 'Install', href: 'https://npmjs.com/package/@odineck/elite-ui', variant: 'primary', target: '_blank' },
                    { label: 'View Example', href: '#/example', variant: 'secondary' }
                ]
            })
            hero.mount()
        }

        // 7. Mount FeatureCards
        if (window.FeatureCard) {
            const features = [
                { title: 'Secure', description: 'Built-in XSS protection, CSRF tokens, and sanitization.', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>' },
                { title: 'Fast', description: 'Pure vanilla JavaScript with direct DOM manipulation.', icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>' },
                { title: 'Reactive', description: 'SimpleComponent and SimpleStore for reactive state.', icon: '<circle cx="12" cy="12" r="3"></circle><line x1="12" y1="5" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="19"></line>' }
            ]
            features.forEach((f, i) => {
                const fc = new FeatureCard(`#feature-${i + 1}`, f)
                fc.mount()
            })
        }

        // 8. Mount Counter
        if (window.Counter) {
            const counter = new Counter('#component-counter', {
                label: 'Counter',
                initialCount: 0,
                min: 0,
                max: 10
            })
            counter.mount()
        }

        // 9. Dispatch ready
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
