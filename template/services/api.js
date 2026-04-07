/**
 * API Service
 * Base API abstraction using HttpClient from core
 * 
 * Usage:
 * import { api } from './api.js'
 * 
 * // GET
 * const users = await api.get('/users')
 * 
 * // POST
 * const newUser = await api.post('/users', { name: 'John' })
 * 
 * // With interceptors (auto-configured)
 * api.onRequest(req => {
 *     console.log('Request:', req)
 *     return req
 * })
 */

class ApiService extends HttpClient {
    constructor() {
        super({
            baseUrl: $env.get('API_URL', 'https://jsonplaceholder.typicode.com') || 'https://jsonplaceholder.typicode.com',
            timeout: 30000
        })

        this._setupInterceptors()
    }

    _setupInterceptors() {
        // Request interceptor - add auth token
        this.interceptRequest(async (request) => {
            const token = localStorage.getItem('auth_token')
            if (token) {
                request.headers = {
                    ...request.headers,
                    Authorization: `Bearer ${token}`
                }
            }
            return request
        })

        // Response interceptor - handle errors globally
        this.interceptResponse(async (response) => {
            // Log successful responses
            if (response.ok) {
                console.log(`[API] ${response.status} ${response._raw.url}`)
            }
            return response
        })

        // Error interceptor
        this.interceptError(async (error) => {
            // Handle 401 - unauthorized
            if (error.status === 401) {
                localStorage.removeItem('auth_token')
                window.dispatchEvent(new CustomEvent('auth:unauthorized'))
            }
            
            // Handle 403 - forbidden
            if (error.status === 403) {
                window.dispatchEvent(new CustomEvent('auth:forbidden'))
            }
            
            throw error
        })
    }

    /**
     * Shorthand for GET /todos (example)
     */
    async getTodo(id = 1) {
        const res = await this.get(`/todos/${id}`)
        return res.data
    }

    /**
     * Shorthand for GET /posts
     */
    async getPosts() {
        const res = await this.get('/posts')
        return res.data
    }

    /**
     * Shorthand for GET /users
     */
    async getUsers() {
        const res = await this.get('/users')
        return res.data
    }
}

// Export singleton instance
const api = new ApiService()
export { api }
export { ApiService }
