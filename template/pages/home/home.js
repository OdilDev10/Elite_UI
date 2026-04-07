/**
 * Home Page Component
 * Loads home.html template and sets data
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
}

window.HomePage = HomePage
