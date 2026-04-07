/**
 * HttpClient
 * Wrapper centralizado para fetch con interceptors, auth, error handling
 *
 * Uso:
 * const http = new HttpClient({ baseUrl: '/api' })
 * const data = await http.get('/users')
 * await http.post('/users', { name: 'Juan' })
 */

class HttpClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || ''
    this.timeout = options.timeout || 30000
    this.headers = options.headers || {}

    this.requestInterceptors = []
    this.responseInterceptors = []
    this.errorInterceptors = []
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data
    })
  }

  /**
   * PATCH request
   */
  async patch(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: data
    })
  }

  /**
   * PUT request
   */
  async put(url, data = null, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data
    })
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' })
  }

  /**
   * Main request method
   */
  async request(url, options = {}) {
    const fullUrl = this._buildUrl(url)
    const method = options.method || 'GET'
    const timeout = options.timeout || this.timeout

    try {
      // Build request
      let request = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
          ...options.headers
        },
        ...options
      }

      // Run request interceptors
      for (const interceptor of this.requestInterceptors) {
        try {
          request = await interceptor(request)
        } catch (e) {
          console.error('[HttpClient] request interceptor error:', e)
        }
      }

      // Add body if needed
      if (options.body && method !== 'GET' && method !== 'DELETE') {
        request.body = typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body)
      }

      // Fetch with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(fullUrl, {
        ...request,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Parse response
      const contentType = response.headers.get('content-type')
      let data = null

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text')) {
        data = await response.text()
      } else {
        data = await response.blob()
      }

      // Build response object
      let responseObj = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data,
        headers: response.headers,
        _raw: response
      }

      // Run response interceptors
      for (const interceptor of this.responseInterceptors) {
        try {
          responseObj = await interceptor(responseObj)
        } catch (e) {
          console.error('[HttpClient] response interceptor error:', e)
        }
      }

      // Handle errors
      if (!response.ok) {
        const error = new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          data,
          response
        )

        // Run error interceptors
        for (const interceptor of this.errorInterceptors) {
          try {
            await interceptor(error)
          } catch (e) {
            console.error('[HttpClient] error interceptor failed:', e)
          }
        }

        throw error
      }

      return responseObj
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }

      // Timeout or network error
      if (error.name === 'AbortError') {
        throw new HttpError(
          `Request timeout (${timeout}ms)`,
          0,
          null,
          null
        )
      }

      throw new HttpError(
        error.message || 'Network request failed',
        0,
        null,
        null
      )
    }
  }

  /**
   * Add request interceptor
   */
  interceptRequest(handler) {
    this.requestInterceptors.push(handler)
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(h => h !== handler)
    }
  }

  /**
   * Add response interceptor
   */
  interceptResponse(handler) {
    this.responseInterceptors.push(handler)
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(h => h !== handler)
    }
  }

  /**
   * Add error interceptor
   */
  interceptError(handler) {
    this.errorInterceptors.push(handler)
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(h => h !== handler)
    }
  }

  /**
   * Set default headers
   */
  setHeaders(headers) {
    this.headers = { ...this.headers, ...headers }
  }

  /**
   * Set auth token
   */
  setAuthToken(token) {
    if (token) {
      this.setHeaders({ Authorization: `Bearer ${token}` })
    } else {
      const { Authorization, ...rest } = this.headers
      this.headers = rest
    }
  }

  /**
   * Build full URL
   */
  _buildUrl(path) {
    if (path.startsWith('http')) return path
    return this.baseUrl + (path.startsWith('/') ? path : '/' + path)
  }
}

/**
 * HttpError
 * Custom error for HTTP requests
 */
class HttpError extends Error {
  constructor(message, status, data, response) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
    this.response = response
  }

  isClientError() {
    return this.status >= 400 && this.status < 500
  }

  isServerError() {
    return this.status >= 500
  }

  isNetworkError() {
    return this.status === 0
  }

  isTimeout() {
    return this.message.includes('timeout')
  }
}

window.HttpClient = HttpClient
window.HttpError = HttpError
