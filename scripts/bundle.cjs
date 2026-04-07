/**
 * Bundle script for EliteUI framework
 * Concatenates all core files into elite-ui.min.js
 * Strips ES module exports and attaches to window object
 */
const fs = require('fs')
const path = require('path')

const coreDir = path.join(__dirname, '..', 'core')
const distDir = path.join(__dirname, '..', 'dist')

const files = [
  'SimpleComponent.js',
  'MetaManager.js',
  'SimpleStore.js',
  'store.js',
  'Context.js',
  'ErrorBoundary.js',
  'router.js',
  'LazyLoader.js',
  'HttpClient.js',
  'http.js',
  'debug.js',
  'Validators.js',
  'useForm.js',
  'DomUtils.js',
  'DevTools.js',
  'Analytics.js',
  'permissions.js',
  'env.js',
  'schema.js',
  'lang/i18n.js',
  // Types - field definitions
  'types/fields/text.js',
  'types/fields/select.js',
  'types/fields/idFields.js',
  'types/fields/dateFields.js',
  'types/fields/toggles.js',
  'types/fields/special.js',
  'types/fields/custom.js',
  'types/fields/factory.js',
  'types/fields/index.js',
  // Types - schemas (not bundled - user defines their own)
  // 'types/schemas/user.js',
  // 'types/schemas/common.js',
  // 'types/schemas/index.js',
  // Types - interfaces (JSDoc only, no code)
  'types/interfaces.js',
  'types/index.js',
  // Components
  'components/SmartForm/SmartForm.js',
  'components/SmartForm/index.js',
  // Main index
  'index.js',
]

function banner() {
  return `/**
 * EliteUI - Production-ready vanilla JavaScript framework
 * Version 1.0.0
 * Zero runtime dependencies
 */
`
}

/**
 * Strip ES module exports and collect exported names
 */
function stripExports(code) {
  const exportedNames = []
  let result = code

  // Remove: export const xxx =
  result = result.replace(/export\s+const\s+(\w+)\s*=/g, (match, name) => {
    exportedNames.push(name)
    return `const ${name} =`
  })

  // Remove: export function xxx(
  result = result.replace(/export\s+function\s+(\w+)\s*\(/g, (match, name) => {
    exportedNames.push(name)
    return `function ${name}(`
  })

  // Remove: export class xxx
  result = result.replace(/export\s+class\s+(\w+)/g, (match, name) => {
    exportedNames.push(name)
    return `class ${name}`
  })

  // Remove: export { xxx, yyy } from 'module'
  result = result.replace(/export\s*\{\s*([^}]+)\s*\}\s*from\s*['"][^'"]+['"]/g, (match, names) => {
    names.split(',').forEach(name => {
      const trimmed = name.trim()
      if (trimmed) exportedNames.push(trimmed)
    })
    return ''
  })

  // Remove: export { xxx, yyy } (without from)
  result = result.replace(/export\s*\{\s*([^}]+)\s*\}/g, (match, names) => {
    names.split(',').forEach(name => {
      const trimmed = name.trim()
      if (trimmed) exportedNames.push(trimmed)
    })
    return ''
  })

  // Remove: export * from 'xxx' (skip)
  result = result.replace(/export\s*\*\s*from\s*['"][^'"]+['"]/g, '')

  // Remove: export default xxx
  result = result.replace(/export\s+default\s+(\w+)/g, (match, name) => {
    exportedNames.push(name)
    return `// default: ${name}`
  })

  return { code: result, exports: exportedNames }
}

/**
 * Add window assignments for collected exports
 */
function addWindowAssignments(code, exports) {
  if (exports.length === 0) return code

  const assignments = exports.map(name => `window.${name} = ${name}`).join('\n')
  return code + '\n\n// Exports\n' + assignments
}

function minify(code) {
  return code
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function bundle() {
  console.log('Building EliteUI bundle...\n')

  let combined = banner()
  const allExports = []

  for (const file of files) {
    const filePath = path.join(coreDir, file)
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8')
      
      // Strip exports and collect exported names
      const { code, exports } = stripExports(content)
      content = code
      allExports.push(...exports)
      
      combined += '\n' + content
      console.log(`  + ${file}`)
    } else {
      console.warn(`  ! ${file} not found, skipping`)
    }
  }

  // Add window assignments for all exports
  const finalCode = addWindowAssignments(combined, allExports)
  const minified = minify(finalCode)

  fs.writeFileSync(path.join(distDir, 'elite-ui.min.js'), minified)
  console.log(`\nBundle created: dist/elite-ui.min.js (${minified.length} bytes)`)
  console.log(`Total exports attached to window: ${allExports.length}`)
}

bundle().catch(console.error)
