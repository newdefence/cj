// https://eslint.org/docs/user-guide/configuring
// https://github.com/yannickcr/eslint-plugin-react
// https://github.com/prettier/eslint-config-prettier

module.exports = {
    extends: ['eslint:recommended', 'react-app'],
    rules: {
        'comma-dangle': [2, {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
        }],
        eqeqeq: [2, 'smart'],
        indent: [2, 4],
        'max-len': [1, { code: 240, ignoreUrls: true }],
        'no-console': 0,
        quotes: [2, 'single', { avoidEscape: true, allowTemplateLiterals: true }],
        'react/jsx-max-props-per-line': [1, { maximun: 10, when: 'multiline' }]
    }
};
