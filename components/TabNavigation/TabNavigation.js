/**
 * TabNavigation Component
 * Gestiona navegación entre tabs con directivas data-onclick y data-class-active
 *
 * Props:
 * - tabs: Array de { id, label }
 * - activeTab: tab activo por defecto (default: 'overview')
 * - onTabChange: callback cuando cambia de tab
 */

class TabNavigation extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            activeTab: props.activeTab || 'overview'
        })
        this._props = {
            tabs: [
                { id: 'overview', label: 'Overview' },
                { id: 'components', label: 'Components' },
                { id: 'http', label: '$http' },
                { id: 'schema', label: '$schema' },
                { id: 'validators', label: 'Validators' },
                { id: 'debug', label: '$debug' },
                { id: 'router', label: 'Router' }
            ],
            onTabChange: null,
            ...props
        }
    }

    async render() {
        if (!this.el) return

        // Cargar template principal
        this.el.innerHTML = await this.loadTemplate('TabNavigation')

        // Generar botones de tabs dinámicamente
        const container = this.el.querySelector('#tabs-container')
        const { tabs } = this._props

        container.innerHTML = tabs.map(tab => `
            <button
                class="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap border-transparent text-text-secondary hover:text-accent"
                data-onclick="selectTab"
                data-tab-id="${tab.id}"
                data-class-active="activeTab === '${tab.id}'"
                data-class-accent="activeTab === '${tab.id}'"
            >
                ${this._escapeHtml(tab.label)}
            </button>
        `).join('')
    }

    /**
     * Cambiar tab activo (llamado por data-onclick)
     */
    selectTab(e) {
        const tabId = e.target.dataset.tabId
        this.setState({ activeTab: tabId })
        if (this._props.onTabChange) {
            this._props.onTabChange(tabId)
        }
    }
}

window.TabNavigation = TabNavigation
