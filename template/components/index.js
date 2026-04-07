/**
 * Components Index
 * Exporta todos los componentes del proyecto
 * 
 * Usage:
 * import { Button, ThemeToggle, Hero } from './index.js'
 * 
 * O individualmente:
 * import { Button } from './index.js'
 */

export { Button } from './Button/Button.js'
export { ThemeToggle } from './ThemeToggle/ThemeToggle.js'

// Registry
window.__eliteComponents = {
    Button: true,
    ThemeToggle: true
}
