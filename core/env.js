/**
 * Env - Environment Variables Reader
 * Reads from window.ENV or meta tags
 * 
 * Usage:
 * // In HTML: <meta name="env" data-api-url="https://api.example.com" data-api-key="abc123">
 * // Or set window.ENV before loading this script
 * 
 * window.ENV = {
 *   API_URL: 'https://api.example.com',
 *   API_KEY: 'abc123'
 * }
 * 
 * const apiUrl = $env('API_URL')
 */

class Env {
    constructor() {
        this._vars = {}
        this._loaded = false
    }

    /**
     * Load env from meta tags or window.ENV
     */
    load() {
        if (this._loaded) return

        // Try window.ENV first
        if (window.ENV && typeof window.ENV === 'object') {
            this._vars = { ...window.ENV }
        }

        // Try meta tags
        const meta = document.querySelector('meta[name="env"]')
        if (meta) {
            const data = meta.dataset
            Object.keys(data).forEach(key => {
                // Convert kebab-case to UPPER_SNAKE_CASE
                const envKey = key.replace(/-/g, '_').toUpperCase()
                this._vars[envKey] = data[key]
            })
        }

        // Try script tag (inline config)
        const config = document.querySelector('script[type="env/config"]')
        if (config) {
            try {
                const data = JSON.parse(config.textContent)
                this._vars = { ...this._vars, ...data }
            } catch (e) {
                console.warn('[Env] Invalid config JSON')
            }
        }

        this._loaded = true
    }

    /**
     * Get env variable
     * @param {string} key - Variable name
     * @param {any} defaultValue - Default if not found
     */
    get(key, defaultValue = null) {
        if (!this._loaded) this.load()
        return this._vars[key] ?? defaultValue
    }

    /**
     * Check if variable exists
     */
    has(key) {
        if (!this._loaded) this.load()
        return key in this._vars
    }

    /**
     * Get all variables
     */
    all() {
        if (!this._loaded) this.load()
        return { ...this._vars }
    }
}

const $env = new Env()
window.$env = $env
window.Env = Env
