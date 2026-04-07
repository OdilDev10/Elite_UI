/**
 * Auth Service
 * Authentication abstraction using API
 * 
 * Usage:
 * import { auth } from './auth.js'
 * 
 * await auth.login('user@example.com', 'password')
 * await auth.logout()
 * const user = auth.currentUser()
 */

import { api } from './api.js'

class AuthService {
    constructor() {
        this._user = null
        this._token = localStorage.getItem('auth_token')
    }

    /**
     * Get current user
     */
    currentUser() {
        return this._user
    }

    /**
     * Check if logged in
     */
    isAuthenticated() {
        return !!this._token
    }

    /**
     * Login
     */
    async login(email, password) {
        try {
            const res = await api.post('/auth/login', { email, password })
            this._token = res.data?.token
            this._user = res.data?.user
            if (this._token) {
                localStorage.setItem('auth_token', this._token)
            }
            return { success: true, user: this._user }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    /**
     * Register
     */
    async register(data) {
        try {
            const res = await api.post('/auth/register', data)
            this._token = res.data?.token
            this._user = res.data?.user
            if (this._token) {
                localStorage.setItem('auth_token', this._token)
            }
            return { success: true, user: this._user }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    /**
     * Logout
     */
    logout() {
        this._token = null
        this._user = null
        localStorage.removeItem('auth_token')
        window.dispatchEvent(new CustomEvent('auth:logged_out'))
    }

    /**
     * Get token
     */
    getToken() {
        return this._token
    }
}

const auth = new AuthService()
export { auth }
export { AuthService }
