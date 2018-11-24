module.exports = {
  // https://babeljs.io/docs/en/next/babel-preset-env
  presets: [
    ['@babel/preset-env', {
      targets: {
        esmodules: false,
        browsers: ['iOS >= 8', 'Android >= 4.1'],
      },
      modules: false,
    }],
    '@babel/preset-react',
  ],
  plugins: [
    // '@babel/plugin-syntax-dynamic-import', // 暂时去掉，此项目暂时不需要动态引入
    // '@babel/plugin-syntax-jsx',
    '@babel/plugin-transform-react-jsx',
    // useBuiltIns: true, polyfill: false, corejs: false, 
    ['@babel/plugin-transform-runtime', { regenerator: false, useESModules: false, helpers: true }],
    'transform-remove-strict-mode',
  ],
};
