/**
 * Counter Component
 * Demonstrates: internal state, setState(), callbacks to parent
 */

class Counter extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, { count: props.initialCount ?? 0 })
        this._props = {
            label: 'Counter',
            step: 1,
            min: null,
            max: null,
            initialCount: 0,
            onCountChange: null,
            ...props
        }
    }

    render() {
        if (!this.el) return

        const { count } = this.state
        const { label, min, max } = this._props

        const isMinDisabled = min !== null && count <= min
        const isMaxDisabled = max !== null && count >= max

        this.el.innerHTML = `
            <div class="counter-card">
                <span class="counter-label">${label}</span>
                <div class="counter-controls">
                    <button class="counter-btn" data-action="dec" ${isMinDisabled ? 'disabled' : ''}>−</button>
                    <span class="counter-value">${count}</span>
                    <button class="counter-btn" data-action="inc" ${isMaxDisabled ? 'disabled' : ''}>+</button>
                </div>
            </div>
        `
    }

    onMount() {
        this.on('click', '[data-action]:not([disabled])', (e) => {
            const action = e.target.closest('[data-action]').dataset.action
            const delta = action === 'inc' ? this._props.step : -this._props.step
            const newCount = this.state.count + delta

            // Update state, which triggers re-render
            this.setState({ count: newCount })

            // Call parent callback
            this._props.onCountChange?.(newCount)
        })
    }
}

window.Counter = Counter
