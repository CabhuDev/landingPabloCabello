module.exports = {
    env: {
        browser: true,
        serviceworker: true,
        es2022: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'script'
    },
    rules: {
        'no-trailing-spaces': 'error',
        'no-unused-vars': 'warn'
    },
    globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        Response: 'readonly'
    }
};