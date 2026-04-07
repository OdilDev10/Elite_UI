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

    async render() {
        if (!this.el) return

        const { title, subtitle } = this._props

        // Cargar template con valores dinámicos
        this.el.innerHTML = await this.loadTemplate('Hero', { title, subtitle })
    }

    onMount() {
        this.renderButtons()
    }

    renderButtons() {
        const { buttons, onButtonClick } = this._props
        const buttonsContainer = this.el.querySelector('#hero-buttons-container')

        if (!buttonsContainer) return

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
