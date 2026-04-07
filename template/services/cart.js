/**
 * Cart Service
 * Shopping cart abstraction using API
 * 
 * Usage:
 * import { cart } from './cart.js'
 * 
 * await cart.addItem({ productId: 1, quantity: 2 })
 * const items = cart.getItems()
 * await cart.checkout()
 */

import { api } from './api.js'
import { createStore } from '../context/store.js'

class CartService {
    constructor() {
        this._store = createStore({
            items: [],
            total: 0
        })
    }

    /**
     * Get cart items
     */
    getItems() {
        return this._store.getState().items
    }

    /**
     * Subscribe to cart changes
     */
    subscribe(listener) {
        return this._store.subscribe(listener)
    }

    /**
     * Add item to cart
     */
    async addItem(productId, quantity = 1) {
        const state = this._store.getState()
        const existingIndex = state.items.findIndex(i => i.productId === productId)

        let newItems
        if (existingIndex >= 0) {
            newItems = state.items.map((item, index) => {
                if (index === existingIndex) {
                    return { ...item, quantity: item.quantity + quantity }
                }
                return item
            })
        } else {
            newItems = [...state.items, { productId, quantity }]
        }

        this._store.setState({
            items: newItems,
            total: this._calculateTotal(newItems)
        })

        return { success: true }
    }

    /**
     * Remove item from cart
     */
    removeItem(productId) {
        const state = this._store.getState()
        const newItems = state.items.filter(i => i.productId !== productId)

        this._store.setState({
            items: newItems,
            total: this._calculateTotal(newItems)
        })

        return { success: true }
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(productId)
        }

        const state = this._store.getState()
        const newItems = state.items.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity }
            }
            return item
        })

        this._store.setState({
            items: newItems,
            total: this._calculateTotal(newItems)
        })

        return { success: true }
    }

    /**
     * Clear cart
     */
    clear() {
        this._store.setState({ items: [], total: 0 })
    }

    /**
     * Get cart total
     */
    getTotal() {
        return this._store.getState().total
    }

    /**
     * Get items count
     */
    getCount() {
        return this._store.getState().items.reduce((sum, item) => sum + item.quantity, 0)
    }

    /**
     * Checkout
     */
    async checkout() {
        const state = this._store.getState()
        try {
            const res = await api.post('/cart/checkout', {
                items: state.items,
                total: state.total
            })
            this.clear()
            return { success: true, order: res.data }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    _calculateTotal(items) {
        return items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
    }
}

const cart = new CartService()
export { cart }
export { CartService }
