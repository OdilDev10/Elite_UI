#!/usr/bin/env node
/**
 * EliteUI Scaffolding Tool
 * Usage: node scripts/create.js my-app
 */

import { mkdir, writeFile, copyFile, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = join(__dirname, '..', 'template')

const VALID_PROJECT_NAME = /^[a-z0-9-_]+$/

async function createProject(projectName) {
    if (!projectName) {
        console.error('❌ Please provide a project name:')
        console.error('   npm create @odineck/elite-ui my-app')
        process.exit(1)
    }

    if (!VALID_PROJECT_NAME.test(projectName)) {
        console.error('❌ Invalid project name. Use lowercase letters, numbers, hyphens, and underscores only.')
        process.exit(1)
    }

    const targetDir = join(process.cwd(), projectName)

    if (existsSync(targetDir)) {
        console.error(`❌ Directory "${projectName}" already exists.`)
        process.exit(1)
    }

    console.log(`\n🚀 Creating EliteUI project: ${projectName}\n`)

    try {
        // Create project directory
        await mkdir(join(targetDir, '.vscode'), { recursive: true })
        await mkdir(join(targetDir, 'components', 'ThemeToggle'), { recursive: true })
        await mkdir(join(targetDir, 'components', 'Button'), { recursive: true })
        await mkdir(join(targetDir, 'context'), { recursive: true })
        await mkdir(join(targetDir, 'core'), { recursive: true })
        await mkdir(join(targetDir, 'css'), { recursive: true })
        await mkdir(join(targetDir, 'lang', 'en'), { recursive: true })
        await mkdir(join(targetDir, 'lang', 'es'), { recursive: true })
        await mkdir(join(targetDir, 'lang', 'pt'), { recursive: true })
        await mkdir(join(targetDir, 'layouts'), { recursive: true })
        await mkdir(join(targetDir, 'pages', 'home'), { recursive: true })
        await mkdir(join(targetDir, 'router'), { recursive: true })
        await mkdir(join(targetDir, 'services'), { recursive: true })

        // Copy template files
        await copyFile(
            join(TEMPLATE_DIR, 'package.json'),
            join(targetDir, 'package.json')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'index.html'),
            join(targetDir, 'index.html')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'css', 'main.css'),
            join(targetDir, 'css', 'main.css')
        )

        // Copy component files
        await copyFile(
            join(TEMPLATE_DIR, 'components', 'ThemeToggle', 'ThemeToggle.js'),
            join(targetDir, 'components', 'ThemeToggle', 'ThemeToggle.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'components', 'Button', 'Button.js'),
            join(targetDir, 'components', 'Button', 'Button.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'components', 'index.js'),
            join(targetDir, 'components', 'index.js')
        )

        // Copy context (store)
        await copyFile(
            join(TEMPLATE_DIR, 'context', 'store.js'),
            join(targetDir, 'context', 'store.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'context', 'index.js'),
            join(targetDir, 'context', 'index.js')
        )

        // Copy services
        await copyFile(
            join(TEMPLATE_DIR, 'services', 'api.js'),
            join(targetDir, 'services', 'api.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'services', 'auth.js'),
            join(targetDir, 'services', 'auth.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'services', 'cart.js'),
            join(targetDir, 'services', 'cart.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'services', 'index.js'),
            join(targetDir, 'services', 'index.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, '.env.example'),
            join(targetDir, '.env.example')
        )

        await copyFile(
            join(TEMPLATE_DIR, '.eslintrc.json'),
            join(targetDir, '.eslintrc.json')
        )

        await copyFile(
            join(TEMPLATE_DIR, '.vscode', 'snippets.code-snippets'),
            join(targetDir, '.vscode', 'snippets.code-snippets')
        )

        // Copy lang files
        await copyFile(
            join(TEMPLATE_DIR, 'lang', 'en', 'common.json'),
            join(targetDir, 'lang', 'en', 'common.json')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'lang', 'es', 'common.json'),
            join(targetDir, 'lang', 'es', 'common.json')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'lang', 'pt', 'common.json'),
            join(targetDir, 'lang', 'pt', 'common.json')
        )

        // Copy pages
        await copyFile(
            join(TEMPLATE_DIR, 'pages', 'home', 'home.js'),
            join(targetDir, 'pages', 'home', 'home.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'pages', 'index.js'),
            join(targetDir, 'pages', 'index.js')
        )

        // Copy router
        await copyFile(
            join(TEMPLATE_DIR, 'router', 'router.js'),
            join(targetDir, 'router', 'router.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'router', 'index.js'),
            join(targetDir, 'router', 'index.js')
        )

        // Copy layouts
        await copyFile(
            join(TEMPLATE_DIR, 'layouts', 'MainLayout.js'),
            join(targetDir, 'layouts', 'MainLayout.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'layouts', 'AdminLayout.js'),
            join(targetDir, 'layouts', 'AdminLayout.js')
        )

        await copyFile(
            join(TEMPLATE_DIR, 'layouts', 'index.js'),
            join(targetDir, 'layouts', 'index.js')
        )

        // Update package.json with project name
        const pkgContent = await readFile(join(targetDir, 'package.json'), 'utf-8')
        const pkg = JSON.parse(pkgContent)
        pkg.name = projectName
        await writeFile(
            join(targetDir, 'package.json'),
            JSON.stringify(pkg, null, 2)
        )

        console.log('✅ Project created successfully!\n')
        console.log('📁 Project structure:')
        console.log(`
${projectName}/
├── .eslintrc.json
├── .vscode/
│   └── snippets.code-snippets
├── index.html
├── .env.example
├── package.json
├── css/
│   └── main.css
├── components/
│   ├── index.js
│   ├── ThemeToggle/
│   │   └── ThemeToggle.js
│   └── Button/
│       └── Button.js
├── context/
│   ├── index.js
│   └── store.js
├── core/
├── layouts/
│   ├── index.js
│   ├── MainLayout.js
│   └── AdminLayout.js
├── lang/
│   ├── en/
│   │   └── common.json
│   ├── es/
│   │   └── common.json
│   └── pt/
│       └── common.json
├── pages/
│   ├── index.js
│   └── home/
│       └── home.js
├── router/
│   ├── index.js
│   └── router.js
└── services/
    ├── index.js
    ├── api.js
    ├── auth.js
    └── cart.js
`)
        console.log('📦 Next steps:')
        console.log(`   cd ${projectName}`)
        console.log('   npm install')
        console.log('   npm run dev\n')

    } catch (error) {
        console.error('❌ Error creating project:', error.message)
        process.exit(1)
    }
}

// Get project name from command line arguments
const args = process.argv.slice(2)
const projectName = args[0]

createProject(projectName)
