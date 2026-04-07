/**
 * Permissions System
 * Lightweight role-based access control
 * 
 * Usage:
 * $permissions.define('admin', ['read', 'write', 'delete'])
 * $permissions.grant('john', 'admin')
 * $permissions.has('john', 'write') // true
 * 
 * Or with roles config:
 * $permissions.define('admin', ['users.read', 'users.write'])
 * $permissions.define('user', ['users.read'])
 */

class Permissions {
    constructor() {
        this._roles = new Map()
        this._users = new Map()
        this._currentUser = null
    }

    /**
     * Define a role with its permissions
     */
    define(role, permissions) {
        this._roles.set(role, new Set(permissions))
    }

    /**
     * Grant role to user
     */
    grant(userId, role) {
        this._users.set(userId, role)
        if (!this._currentUser) {
            this._currentUser = userId
        }
    }

    /**
     * Revoke role from user
     */
    revoke(userId) {
        this._users.delete(userId)
    }

    /**
     * Set current user
     */
    setCurrentUser(userId) {
        this._currentUser = userId
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this._currentUser
    }

    /**
     * Check if user has permission
     */
    has(userId, permission) {
        const role = this._users.get(userId)
        if (!role) return false
        
        const permissions = this._roles.get(role)
        if (!permissions) return false

        // Check exact permission or wildcard (e.g., 'admin.*')
        if (permissions.has(permission)) return true
        
        // Check wildcard permission
        const [namespace] = permission.split('.')
        if (permissions.has(`${role}.*`)) return true
        if (permissions.has(`${namespace}.*`)) return true
        
        return false
    }

    /**
     * Check if current user has permission
     */
    can(permission) {
        return this.has(this._currentUser, permission)
    }

    /**
     * Check if user has role
     */
    is(userId, role) {
        return this._users.get(userId) === role
    }

    /**
     * Check if current user is role
     */
    isRole(role) {
        return this.is(this._currentUser, role)
    }

    /**
     * Get user role
     */
    getRole(userId) {
        return this._users.get(userId)
    }

    /**
     * Get all permissions for user
     */
    getPermissions(userId) {
        const role = this._users.get(userId)
        if (!role) return []
        const permissions = this._roles.get(role)
        return permissions ? [...permissions] : []
    }

    /**
     * Remove role definition
     */
    removeRole(role) {
        this._roles.delete(role)
    }

    /**
     * Clear all data
     */
    reset() {
        this._roles.clear()
        this._users.clear()
        this._currentUser = null
    }
}

const $permissions = new Permissions()
window.$permissions = $permissions
window.Permissions = Permissions

// Default roles (optional - can be removed)
$permissions.define('guest', ['read'])
$permissions.define('user', ['read', 'profile.read'])
$permissions.define('admin', ['read', 'write', 'delete', 'admin.access'])

console.log('[$permissions] Role-based permissions ready')
