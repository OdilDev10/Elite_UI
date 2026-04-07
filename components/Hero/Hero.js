/**
 * Hero Component
 * Composes Button components for CTA buttons
 * Renders template structure with dynamic content
 */

class Hero extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {})
        this._props = {
            title: 'Vanilla JS Framework',
            subtitle: 'Zero dependencies. Security first. Production ready infrastructure for modern web apps.',
            buttons: [
                { label: 'Install', href: 'https://npmjs.com/package/@odineck/elite-ui', variant: 'primary', target: '_blank' },
                { label: 'Example', href: 'example.html', variant: 'secondary' }
            ],
            onButtonClick: null,
            ...props
        }
    }

    onMount() {
        this.setupEventListeners()
    }

    setupEventListeners() {
        // Event delegation if needed
    }

    render() {
        if (!this.el) return

        const { title, subtitle, buttons, onButtonClick } = this._props

        // Render main structure
        this.el.innerHTML = `
            <div class="hero-card">
                <div class="hero-content">
                    <h1 class="hero-title">${title}</h1>
                    <p class="hero-subtitle">${subtitle}</p>
                    <div class="hero-buttons" id="hero-buttons-container"></div>
                </div>
            </div>

            <div class="visual-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width: 100px; height: 100px; opacity: 0.4;">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            </div>
        `

        // Render button components inside
        const buttonsContainer = this.el.querySelector('#hero-buttons-container')
        buttons.forEach(btnProps => {
            const btnWrapper = document.createElement('div')
            buttonsContainer.appendChild(btnWrapper)

            // Create Button component with click callback
            const button = this.registerChild(new Button(btnWrapper, {
                ...btnProps,
                onClick: (e) => {
                    e.preventDefault()
                    onButtonClick?.(btnProps, e)
                }
            }))
            button.mount()
        })
    }
}

window.Hero = Hero
