// ESLint v9 configuración para Pablo Cabello Web
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                performance: 'readonly',
                setInterval: 'readonly',
                setTimeout: 'readonly',
                location: 'readonly',
                Date: 'readonly',
                Math: 'readonly',
                FormData: 'readonly',
                gtag: 'readonly',
                dataLayer: 'readonly',
                hj: 'readonly',
                trackMicroConversion: 'readonly',
                trackFormProgress: 'readonly',
                trackConversion: 'readonly'
            },
            ecmaVersion: 2022,
            sourceType: 'module'
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'prefer-const': 'warn',
            'no-var': 'error',
            'curly': 'off',
            'no-undef': 'error',
            'eqeqeq': 'error',
            'no-trailing-spaces': 'error',
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always']
        }
    }
];
