/**
 * Router Instance
 * Creates and exports the router singleton
 */

import { EliteRouter } from '../../core/router.js'

const router = new EliteRouter({
    useHash: true,
    layout: 'layout-main'
})

export { router }
