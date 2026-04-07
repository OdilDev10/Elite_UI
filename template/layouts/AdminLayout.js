/**
 * Admin Layout
 * Layout with sidebar for admin pages
 */

class AdminLayout extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            title: 'Admin Dashboard',
            ...props
        })
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = `
            <div class="flex min-h-screen">
                <aside class="w-64 bg-zinc-900 text-white p-6">
                    <h2 class="text-lg font-bold mb-6">Admin</h2>
                    <nav class="space-y-2">
                        <a href="#/admin/users" class="block px-4 py-2 rounded hover:bg-zinc-800">Users</a>
                        <a href="#/admin/settings" class="block px-4 py-2 rounded hover:bg-zinc-800">Settings</a>
                        <a href="#/" class="block px-4 py-2 rounded hover:bg-zinc-800">Back to App</a>
                    </nav>
                </aside>
                
                <main class="flex-1 p-6">
                    <div id="page-admin-content">
                        <!-- Child page content -->
                    </div>
                </main>
            </div>
        `
    }
}

window.AdminLayout = AdminLayout
