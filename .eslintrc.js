// https://eslint.org/docs/user-guide/configuring
// https://github.com/yannickcr/eslint-plugin-react
// https://github.com/prettier/eslint-config-prettier

module.exports = {
  extends: ['eslint:recommended', 'react-app', 'plugin:prettier/recommended'],
  rules: {
    eqeqeq: [2, 'smart'],
    'max-len': [1, { code: 240, ignoreUrls: true }],
    quotes: [2, 'single'],
    'react/jsx-max-props-per-line': [1, { maximun: 10, when: 'multiline' }]
  }
};
