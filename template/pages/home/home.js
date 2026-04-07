/**
 * Home Page Component
 * Composes multiple components into a single page
 */

class HomePage extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: 'Welcome to EliteUI',
            subtitle: 'Start building your app by editing components/',
            ...props
        })
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('page-home')
    }

    onMount() {
        this.mountComponents()
    }

    mountComponents() {
        this._renderHero()
        this._renderFeatures()
        this._renderCounter()
    }

    _renderHero() {
        const heroEl = this.el.querySelector('#hero-container')
        if (heroEl && window.Hero) {
            const hero = new Hero('#hero-container', {
                title: this._state.title,
                subtitle: this._state.subtitle,
                buttons: [
                    { label: 'Install', href: 'https://npmjs.com/package/@odineck/elite-ui', variant: 'primary', target: '_blank' },
                    { label: 'View Example', href: '#/example', variant: 'secondary' }
                ]
            })
            this.registerChild(hero)
            hero.mount()
        }
    }

    _renderFeatures() {
        const features = [
            { title: 'Secure', description: 'Built-in XSS protection, CSRF tokens, and sanitization.', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>' },
            { title: 'Fast', description: 'Pure vanilla JavaScript with direct DOM manipulation.', icon: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>' },
            { title: 'Reactive', description: 'SimpleComponent and SimpleStore for reactive state.', icon: '<circle cx="12" cy="12" r="3"></circle><line x1="12" y1="5" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="19"></line>' }
        ]

        features.forEach((f, i) => {
            const featureEl = this.el.querySelector(`#feature-${i + 1}`)
            if (featureEl && window.FeatureCard) {
                const fc = new FeatureCard(`#feature-${i + 1}`, f)
                this.registerChild(fc)
                fc.mount()
            }
        })
    }

    _renderCounter() {
        const counterEl = this.el.querySelector('#counter-container')
        if (counterEl && window.Counter) {
            const counter = new Counter('#counter-container', {
                label: 'Counter',
                initialCount: 0,
                min: 0,
                max: 10
            })
            this.registerChild(counter)
            counter.mount()
        }
    }

    onUnmount() {
        super.onUnmount()
    }
}

window.HomePage = HomePage