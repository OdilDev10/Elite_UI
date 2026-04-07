/**
 * $http - Ultra simple HTTP client
 * Wrapper minimalista sobre fetch con API intuitiva
 * 
 * Uso:
 * 
 * // GET simple
 * const data = await $http('/users')
 * 
 * // POST con body
 * const user = await $http('/users', { name: 'Juan' })
 * 
 * // Con opciones
 * const data = await $http('/users', {
 *   method: 'POST',
 *   body: { name: 'Juan' },
 *   headers: { 'X-Custom': 'value' }
 * })
 * 
 * // Instancia personalizada
 * const api = $http.create({ baseUrl: '/api' })
 * await api('/users')
 */

class $HttpClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || ''
    this.timeout = options.timeout || 10000
    this.defaults = options.headers ? { headers: options.headers } : {}
  }

  async request(url, options = {}) {
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaults.headers,
        ...options.headers
      },
      ...options
    }

    // Body handling
    if (config.body && typeof config.body === 'object' && config.method !== 'GET') {
      config.body = JSON.stringify(config.body)
    }

    // Build URL
    let fullUrl = url
    if (!url.startsWith('http')) {
      fullUrl = this.baseUrl + (url.startsWith('/') ? url : '/' + url)
    }

    // Timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    config.signal = controller.signal

    try {
      const res = await fetch(fullUrl, config)
      clearTimeout(timeoutId)

      // Parse response
      const contentType = res.headers.get('content-type')
      let data

      if (res.status === 204) {
        data = null
      } else if (contentType?.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      if (!res.ok) {
        throw new $HttpError(`HTTP ${res.status}`, res.status, data)
      }

      return data

    } catch (e) {
      clearTimeout(timeoutId)
      
      if (e.name === 'AbortError') {
        throw new $HttpError(`Timeout (${this.timeout}ms)`, 0, null)
      }
      
      if (e instanceof $HttpError) throw e
      
      throw new $HttpError(e.message || 'Request failed', 0, null)
    }
  }

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body })
  }

  put(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body })
  }

  patch(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', body })
  }

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }
}

class $HttpError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = '$HttpError'
    this.status = status
    this.data = data
  }
}

// Default instance
const $http = new $HttpClient()

// Create custom instance
$http.create = (options) => new $HttpClient(options)

// Export
window.$http = $http
window.$HttpClient = $HttpClient
window.$HttpError = $HttpError

console.log('[$http] Simple HTTP client ready')
