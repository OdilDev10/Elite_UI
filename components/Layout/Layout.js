/**
 * Layout Component
 * Base layout with named outlets for child content
 * 
 * Usage:
 * <nav data-outlet="sidebar"></nav>
 * <main data-outlet="content"></main>
 * <aside data-outlet="panel"></aside>
 * 
 * mountOutlet(name, ComponentClass, props)
 */

class Layout extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, props)
        this._outlets = {}
        this._mountedOutlets = {}
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('Layout', this._props)
    }

    onMount() {
        this._discoverOutlets()
    }

    _discoverOutlets() {
        const outlets = this.el.querySelectorAll('[data-outlet]')
        outlets.forEach(el => {
            const name = el.dataset.outlet
            this._outlets[name] = el
        })
    }

    mountOutlet(name, ComponentClass, props = {}) {
        const outlet = this._outlets[name] || this.el.querySelector(`[data-outlet="${name}"]`)
        
        if (!outlet) {
            console.warn(`[Layout] Outlet not found: ${name}`)
            return null
        }

        // Unmount existing if any
        if (this._mountedOutlets[name]) {
            this._mountedOutlets[name].unmount()
        }

        const component = new ComponentClass(outlet, props)
        this.registerChild(component)
        component.mount()
        this._mountedOutlets[name] = component

        return component
    }

    getOutlet(name) {
        return this._mountedOutlets[name] || null
    }

    unmountOutlet(name) {
        if (this._mountedOutlets[name]) {
            this._mountedOutlets[name].unmount()
            delete this._mountedOutlets[name]
        }
    }

    onUnmount() {
        // Clean up all mounted outlets
        Object.keys(this._mountedOutlets).forEach(name => {
            this.unmountOutlet(name)
        })
    }
}

window.Layout = Layout