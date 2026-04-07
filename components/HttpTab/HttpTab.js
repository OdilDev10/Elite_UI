/**
 * HttpTab Component
 * Documentación de $http client con demo en vivo
 */

class HttpTab extends SimpleComponent {
    constructor(selector) {
        super(selector, {})
    }

    async render() {
        if (!this.el) return
        this.el.innerHTML = await this.loadTemplate('HttpTab')
    }

    onMount() {
        this.setupFetchDemo()
    }

    setupFetchDemo() {
        const btnFetch = this.el.querySelector('#btn-fetch-todo')
        if (btnFetch) {
            btnFetch.addEventListener('click', async () => {
                const fetchResult = this.el.querySelector('#fetch-result')
                const fetchResultContent = this.el.querySelector('#fetch-result-content')
                const fetchError = this.el.querySelector('#fetch-error')
                const fetchErrorContent = this.el.querySelector('#fetch-error-content')

                btnFetch.disabled = true
                btnFetch.textContent = 'Loading...'
                fetchResult.classList.add('hidden')
                fetchError.classList.add('hidden')

                try {
                    const todo = await $http('https://jsonplaceholder.typicode.com/todos/1')
                    fetchResultContent.textContent = JSON.stringify(todo, null, 2)
                    fetchResult.classList.remove('hidden')
                    $debug?.log?.('$http demo', todo)
                } catch (e) {
                    fetchErrorContent.textContent = e.message
                    fetchError.classList.remove('hidden')
                    $debug?.error?.('$http demo failed', e)
                } finally {
                    btnFetch.disabled = false
                    btnFetch.textContent = 'Fetch /todos/1'
                }
            })
        }
    }
}

window.HttpTab = HttpTab
