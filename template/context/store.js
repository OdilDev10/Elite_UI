/**
 * Store Context
 * Simple state management inspired by Zustand
 * Usage:
 *   const store = createStore({ count: 0, name: 'John' })
 *   store.subscribe(state => console.log(state))
 *   store.setState({ count: state.count + 1 })
 */

class Store {
    constructor(initialState = {}) {
        this._state = initialState
        this._listeners = []
    }

    getState() {
        return { ...this._state }
    }

    setState(updates) {
        const prev = this._state
        this._state = { ...this._state, ...updates }
        this._listeners.forEach(listener => listener(this._state, prev))
    }

    subscribe(listener) {
        this._listeners.push(listener)
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener)
        }
    }
}

function createStore(initialState) {
    return new Store(initialState)
}

window.Store = Store
window.createStore = createStore
U