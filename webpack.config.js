const path = require('path'); // 引入‘path’，为了在这里使用绝对路径，避免相对路径在不同系统时出现不必要的问题

module.exports = {
  mode: process.env.NODE_ENV,
  // 应用入口
  entry: {
    app: path.join(__dirname, './src/app.js'),  // app.js作为打包的入口
  },
  // 输出目录
  output: {
    filename: '[name].[hash].js',  //name代表entry对应的名字; hash代表 整个app打包完成后根据内容加上hash。一旦整个文件内容变更，hash就会变化
    path: path.join(__dirname, './dist'), // 打包好之后的输出路径
    publicPath: '/public' // 静态资源文件引用时的路径（加在引用静态资源前面的）
  },
  module: {
    rules: [
      { test: /\.jsx$/, loader: 'babel-loader' },
      { test: /\.js$/, loader: 'babel-loader', exclude: [path.join(__dirname, 'node_modules')] },
    ],
  },
  devServer: process.env.NODE_ENV === 'development' ? {
    host: '0.0.0.0',  // 我们可以允许我们用任意方式进行访问（127.0.0.1，localhost, 本机ip）
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    // hot: true,  //启动热加载
    overlay: {  // 错误提醒弹窗小遮层
      errors: true //只显示error
    },
    // 和output配置对应起来
    publicPath: '/public',  // 访问所有静态路径都要前面加/public才能访问生成的静态文件
    historyApiFallback: {
      index: '/public/index.html' // 所有404的请求全部访问该配置下的url
    },
  } : undefined,
};
