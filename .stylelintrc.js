// 1. npm install stylelint-config-standard

// 2. CMD + Shift + P
// 3. Extensions: Install Extensions
// 4. @sort:installs stylelint
// https://github.com/shinnn/vscode-stylelint
// https://stylelint.io/user-guide/rules/

// 5. vs-code user.setting:
// "css.validate": false,
// "less.validate": false,
// "scss.validate": false

// 6. 格式化单个文件：
// yarn stylelint --O
// eg: ./node_modules/.bin/stylelint "foo/*.css" --fix --config ./.stylelintrc.js
// eg: stylelint "test.html" --fix
// https://stylelint.io/user-guide/cli/

// https://github.com/stylelint/stylelint-config-recommended
// https://github.com/stylelint/stylelint-config-standard
// https://github.com/stylelint/stylelint-config-recommended/blob/master/index.js
// https://github.com/stylelint/stylelint-config-standard/blob/master/index.js

module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'comment-empty-line-before': null, // 'always'
    'declaration-block-semicolon-newline-after': null, // always
    'declaration-block-semicolon-space-after': 'always-single-line',
    'declaration-block-single-line-max-declarations': 12,
    'function-url-quotes': 'never',
    indentation: [4, { indentClosingBrace: false, except: ['param'] }],
    'max-line-length': [180, { ignore: ['comments'] }],
    'max-nesting-depth': [6, { ignore: ['pseudo-classes'], ignoreAtRules: ['media'] }],
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['after-rule', 'after-single-line-comment', 'inside-block-and-after-rule', 'inside-block', 'first-nested'],
        ignore: ['after-comment', 'first-nested', 'inside-block']
      }
    ],
    'selector-list-comma-newline-after': 'never-multi-line'
  }
};
