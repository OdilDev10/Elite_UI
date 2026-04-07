/**
 * LazyLoader
 * Carga recursos bajo demanda (scripts, componentes, datos)
 *
 * Uso:
 * const loader = new LazyLoader()
 * await loader.loadScript('js/components/User.js', 'User')
 * await loader.loadData('https://api.example.com/users')
 */

class LazyLoader {
  constructor(options = {}) {
    this._loadedScripts = new Map()
    this._loadedData = new Map()
    this._pendingLoads = new Map()
    this._cache = new Map()
    this._maxCacheSize = options.maxCacheSize || 50
    this._cacheExpiry = options.cacheExpiry || 5 * 60 * 1000 // 5 min default
  }

  /**
   * Load script dynamically
   * @param {string} src
   * @param {string} globalName - esperado en window
   */
  async loadScript(src, globalName = null) {
    // Check if already loaded
    if (this._loadedScripts.has(src)) {
      return this._loadedScripts.get(src)
    }

    // Check if currently loading
    if (this._pendingLoads.has(src)) {
      return this._pendingLoads.get(src)
    }

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.async = true

      script.onload = () => {
        let result = true
        if (globalName && typeof window[globalName] === 'undefined') {
          reject(new Error(`[LazyLoader] ${globalName} not found in window after loading ${src}`))
          return
        }

        if (globalName) {
          result = window[globalName]
        }

        this._loadedScripts.set(src, result)
        this._pendingLoads.delete(src)
        resolve(result)
      }

      script.onerror = () => {
        this._pendingLoads.delete(src)
        reject(new Error(`[LazyLoader] failed to load script: ${src}`))
      }

      document.head.appendChild(script)
    })

    this._pendingLoads.set(src, promise)
    return promise
  }

  /**
   * Load CSS
   */
  async loadCSS(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href

      link.onload = () => resolve(true)
      link.onerror = () => reject(new Error(`[LazyLoader] failed to load CSS: ${href}`))

      document.head.appendChild(link)
    })
  }

  /**
   * Load data (con caching)
   * @param {string} url
   * @param {Object} options - fetch options
   */
  async loadData(url, options = {}) {
    // Check cache
    if (this._cache.has(url)) {
      const cached = this._cache.get(url)
      if (Date.now() - cached.timestamp < this._cacheExpiry) {
        return cached.data
      } else {
        this._cache.delete(url)
      }
    }

    // Check if already loading
    if (this._pendingLoads.has(url)) {
      return this._pendingLoads.get(url)
    }

    const promise = fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`[LazyLoader] HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        // Cache result
        this._cache.set(url, {
          timestamp: Date.now(),
          data
        })

        // Maintain cache size
        if (this._cache.size > this._maxCacheSize) {
          const oldest = Array.from(this._cache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
          this._cache.delete(oldest[0])
        }

        this._pendingLoads.delete(url)
        return data
      })
      .catch(err => {
        this._pendingLoads.delete(url)
        throw err
      })

    this._pendingLoads.set(url, promise)
    return promise
  }

  /**
   * Load JSON (alias for loadData)
   */
  async loadJSON(url, options = {}) {
    return this.loadData(url, options)
  }

  /**
   * Load component module
   * @param {string} modulePath
   * @param {string} className
   */
  async loadComponent(modulePath, className) {
    await this.loadScript(modulePath, className)
    const ComponentClass = window[className]

    if (!ComponentClass) {
      throw new Error(`[LazyLoader] component ${className} not found in window`)
    }

    return ComponentClass
  }

  /**
   * Preload multiple resources
   */
  async preload(resources) {
    const promises = resources.map(resource => {
      if (resource.type === 'script') {
        return this.loadScript(resource.src, resource.globalName)
      } else if (resource.type === 'css') {
        return this.loadCSS(resource.href)
      } else if (resource.type === 'data') {
        return this.loadData(resource.url, resource.options)
      }
    })

    return Promise.all(promises)
  }

  /**
   * Load with timeout
   */
  async loadWithTimeout(promise, timeout = 5000) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('[LazyLoader] timeout')), timeout)
      )
    ])
  }

  /**
   * Retry logic
   */
  async loadWithRetry(fn, maxRetries = 3, delay = 1000) {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (e) {
        lastError = e
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError
  }

  /**
   * Clear cache
   */
  clearCache(url = null) {
    if (url) {
      this._cache.delete(url)
    } else {
      this._cache.clear()
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this._cache.size,
      entries: Array.from(this._cache.entries()).map(([url, data]) => ({
        url,
        timestamp: new Date(data.timestamp).toISOString(),
        age: Date.now() - data.timestamp
      }))
    }
  }

  /**
   * Debug
   */
  debug() {
    console.group('[LazyLoader]')
    console.log('Loaded scripts:', this._loadedScripts.size)
    console.log('Pending loads:', this._pendingLoads.size)
    console.log('Cache:', this.getCacheStats())
    console.groupEnd()
  }
}

window.LazyLoader = LazyLoader
