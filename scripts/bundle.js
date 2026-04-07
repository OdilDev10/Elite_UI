/**
 * Bundle script for EliteUI framework
 * Concatenates all core files into elite-ui.min.js
 */
const fs = require('fs')
const path = require('path')

const coreDir = path.join(__dirname, '..', 'core')
const distDir = path.join(__dirname, '..', 'dist')

const files = [
  'SimpleComponent.js',
  'MetaManager.js',
  'SimpleStore.js',
  'Context.js',
  'ErrorBoundary.js',
  'Router.js',
  'LazyLoader.js',
  'HttpClient.js',
  'Validators.js',
  'useForm.js',
  'DomUtils.js',
  'DevTools.js',
  'Analytics.js',
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

function minify(code) {
  return code
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function bundle() {
  console.log('Building EliteUI bundle...')

  let combined = banner()

  for (const file of files) {
    const filePath = path.join(coreDir, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      combined += '\n' + content
      console.log(`  + ${file}`)
    } else {
      console.warn(`  ! ${file} not found, skipping`)
    }
  }

  const minified = minify(combined)
  fs.writeFileSync(path.join(distDir, 'elite-ui.min.js'), minified)
  console.log(`\nBundle created: dist/elite-ui.min.js (${minified.length} bytes)`)
}

bundle().catch(console.error)
