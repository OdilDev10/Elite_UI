/**
 * Counter Component
 * Demonstrates: internal state + directives (data-text, data-onclick, data-bind-disabled)
 *
 * Props:
 * - label: etiqueta del contador (mostrado via data-text)
 * - step: incremento/decremento (default: 1)
 * - min: valor mínimo (default: null, usado en data-bind-disabled)
 * - max: valor máximo (default: null, usado en data-bind-disabled)
 * - initialCount: valor inicial (default: 0)
 * - onCountChange: callback cuando cambia el count
 *
 * Directivas usadas:
 * - data-text="label" → escribe this.state.label
 * - data-text="count" → escribe this.state.count
 * - data-onclick="increment" → llama this.increment()
 * - data-onclick="decrement" → llama this.decrement()
 * - data-bind-disabled="count <= min" → desactiva botón si expr es true
 * - data-bind-disabled="count >= max" → desactiva botón si expr es true
 */

class Counter extends SimpleComponent {
    constructor(selector, props = {}) {
        super(selector, {
            count: props.initialCount ?? 0,
            label: props.label ?? 'Counter',
            min: props.min ?? null,
            max: props.max ?? null
        })
        this._props = {
            step: 1,
            initialCount: 0,
            onCountChange: null,
            ...props
        }
    }

    async render() {
        if (!this.el) return
        // Cargar template HTML (contiene directivas data-*)
        this.el.innerHTML = await this.loadTemplate('Counter')
    }

    /**
     * Incrementar counter
     */
    increment() {
        const newCount = this.state.count + this._props.step
        this.setState({ count: newCount })
        this._props.onCountChange?.(newCount)
    }

    /**
     * Decrementar counter
     */
    decrement() {
        const newCount = this.state.count - this._props.step
        this.setState({ count: newCount })
        this._props.onCountChange?.(newCount)
    }
}

window.Counter = Counter
