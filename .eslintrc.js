module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/essential',
        '@vue/airbnb',
    ],
    globals: {
        antd: true,
        location: true,
    },
    rules: {
        'comma-dangle': [2, {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
        }],
        eqeqeq: [2, 'smart'],
        'guard-for-in': 'off',
        indent: [2, 4],
        'max-len': ['error', { code: 240, tabWidth: 4 }],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-nested-ternary': 'off',
        'no-restricted-globals': 'off',
        'no-param-reassign': 'off',
        'no-script-url': 'off',
        'object-curly-newline': 'off',
        'one-var': 'off',
        'one-var-declaration-per-line': 'off',
        'prefer-destructuring': 'off',
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};
