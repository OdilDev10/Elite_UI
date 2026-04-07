/**
 * Components Registry
 * Registro global de componentes reutilizables
 * 
 * Para agregar un componente:
 * 1. Crear carpeta en components/NombreComponente/
 * 2. Agregar entrada aquí
 * 3. El ModuleLoader cargará automáticamente:
 *    - components/NombreComponente/NombreComponente.css
 *    - components/NombreComponente/NombreComponente.js
 */

window.__eliteComponents = {
  Button: true,
  Hero: true,
  Counter: true,
  ThemeToggle: true,
  CodeCard: true,
  FeatureCard: true,
  FormCard: true
}
