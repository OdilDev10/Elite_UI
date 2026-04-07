/**
 * EliteUI - Simple i18n System
 * Lightweight internationalization with JSON files
 */

class I18n {
    constructor(defaultLocale = 'en') {
        this.locale = defaultLocale
        this.translations = {}
        this.fallback = {}
    }

    /**
     * Load translations from a JSON object
     * @param {Object} data - Translation data { en: {...}, es: {...} }
     */
    load(data) {
        this.translations = data
        this.fallback = data[this.locale] || {}
    }

    /**
     * Load translations from external JSON files
     * @param {string} path - Base path to lang files (e.g., 'lang/')
     * @param {Array} locales - Available locales ['en', 'es', 'pt']
     */
    async loadFromFiles(path = 'lang/', locales = ['en', 'es']) {
        const promises = locales.map(async (locale) => {
            try {
                const response = await fetch(`${path}${locale}.json`)
                if (response.ok) {
                    this.translations[locale] = await response.json()
                }
            } catch (e) {
                console.warn(`[I18n] Failed to load ${path}${locale}.json`)
            }
        })
        await Promise.all(promises)
        this.fallback = this.translations[this.locale] || {}
    }

    /**
     * Set current locale
     * @param {string} locale - Locale code (en, es, pt)
     */
    setLocale(locale) {
        this.locale = locale
        this.fallback = this.translations[locale] || {}
        localStorage.setItem('elite-locale', locale)
    }

    /**
     * Get current locale
     */
    getLocale() {
        return this.locale
    }

    /**
     * Translate a key
     * @param {string} key - Dot notation key (e.g., 'home.title')
     * @param {Object} params - Replace params {{name}}
     * @returns {string}
     */
    t(key, params = {}) {
        let text = this.fallback[key] || key

        // Try other loaded locales as fallback
        if (text === key) {
            for (const locale in this.translations) {
                if (this.translations[locale][key]) {
                    text = this.translations[locale][key]
                    break
                }
            }
        }

        // Replace params
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param])
        })

        return text
    }

    /**
     * Get all translations for current locale
     */
    getTranslations() {
        return this.fallback
    }
}

// Global instance
window.I18n = I18n
window.$t = null

// Auto-init
window.initI18n = function(defaultLocale = 'en') {
    const savedLocale = localStorage.getItem('elite-locale') || defaultLocale
    window.$i18n = new I18n(savedLocale)
    window.$t = window.$i18n.t.bind(window.$i18n)
    return window.$i18n
}
