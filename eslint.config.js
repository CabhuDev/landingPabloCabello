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
                gtag: 'readonly',
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
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': 'error',
            'curly': 'error',
            'no-trailing-spaces': 'error',
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always']
        }
    }
];
