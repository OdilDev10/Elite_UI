import eslint from 'eslint';

export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                SimpleComponent: 'readonly',
                SimpleStore: 'readonly',
                EliteRouter: 'readonly',
                Router: 'readonly',
                $http: 'readonly',
                $HttpClient: 'readonly',
                $HttpError: 'readonly',
                $env: 'readonly',
                $permissions: 'readonly',
                $i18n: 'readonly',
                $t: 'readonly',
                $validators: 'readonly',
                $debug: 'readonly',
                $schema: 'readonly',
                createStore: 'readonly',
                api: 'readonly',
                auth: 'readonly',
                cart: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                CustomEvent: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Document: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                history: 'readonly',
                fetch: 'readonly',
                Promise: 'readonly',
                Symbol: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': ['off'],
            semi: ['warn', 'always'],
            quotes: ['warn', 'single', { avoidEscape: true }],
            indent: ['warn', 4],
            'comma-dangle': ['warn', 'never'],
            eqeqeq: ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'warn',
            'no-undef': 'warn',
            'block-scoped-var': 'error',
            curly: ['warn', 'all'],
            'default-case': 'warn',
            'no-alert': 'error',
            'no-eval': 'error',
            'no-loop-func': 'error',
            'no-new-func': 'off',
            'no-new-wrappers': 'error',
            'no-param-reassign': 'warn',
            'no-proto': 'error',
            'no-return-assign': ['error', 'always'],
            'no-shadow': 'warn',
            'no-throw-literal': 'error',
            'no-useless-escape': 'error',
            'no-with': 'error',
            'prefer-regex-literals': 'warn',
            'require-await': 'warn'
        }
    },
    {
        ignores: ['dist/**', 'node_modules/**', 'template/**']
    }
];