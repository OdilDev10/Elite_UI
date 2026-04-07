/**
 * Counter Component
 * Uses data-* directives for reactivity
 */

class Counter extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            count: props.initialCount ?? 0,
            label: props.label ?? 'Counter',
            min: props.min ?? null,
            max: props.max ?? null
        })
        this._props = { step: 1, onCountChange: null, ...props }
    }

    render() {
        if (!this.el) return
        this.el.innerHTML = this.loadTemplate('component-counter')
    }

    increment() {
        const newCount = this.state.count + this._props.step
        this.setState({ count: newCount })
        this._props.onCountChange?.(newCount)
    }

    decrement() {
        const newCount = this.state.count - this._props.step
        this.setState({ count: newCount })
        this._props.onCountChange?.(newCount)
    }
}

window.Counter = Counter