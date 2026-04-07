/**
 * NavTab Component
 * Tab navigation with active state
 */

class NavTab extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            tabs: [],
            activeTab: '',
            ...props
        })
        this._props = { onChange: null, ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('NavTab')
    }

    onMount() {
        this._renderTabs()
    }

    _renderTabs() {
        const outlet = this.el.querySelector('[data-outlet="tabs"]')
        if (!outlet) return

        outlet.innerHTML = ''
        this._state.tabs.forEach(tab => {
            const btn = document.createElement('button')
            btn.dataset.tabId = tab.id
            btn.textContent = tab.label
            btn.className = `px-4 py-3 text-sm font-medium border-b-2 transition-colors hover:text-green-600 dark:hover:text-green-400 ${this._state.activeTab === tab.id ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400' : 'border-transparent text-zinc-600 dark:text-zinc-400'}`
            btn.addEventListener('click', (e) => this.selectTab(e))
            outlet.appendChild(btn)
        })
    }

    selectTab(e) {
        const tabId = e.currentTarget.dataset.tabId
        this.setState({ activeTab: tabId })
        this._props.onChange?.(tabId)
        this._renderTabs()
    }
}

window.NavTab = NavTab