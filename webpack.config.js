const path = require('path'); // ���롮path����Ϊ��������ʹ�þ���·�����������·���ڲ�ͬϵͳʱ���ֲ���Ҫ������

module.exports = {
  mode: process.env.NODE_ENV,
  // Ӧ�����
  entry: {
    app: path.join(__dirname, './src/app.js'),  // app.js��Ϊ��������
  },
  // ���Ŀ¼
  output: {
    filename: '[name].[hash].js',  //name����entry��Ӧ������; hash���� ����app�����ɺ�������ݼ���hash��һ�������ļ����ݱ����hash�ͻ�仯
    path: path.join(__dirname, './dist'), // �����֮������·��
    publicPath: '/public' // ��̬��Դ�ļ�����ʱ��·�����������þ�̬��Դǰ��ģ�
  },
  module: {
    rules: [
      { test: /\.jsx$/, loader: 'babel-loader' },
      { test: /\.js$/, loader: 'babel-loader', exclude: [path.join(__dirname, 'node_modules')] },
    ],
  },
  devServer: process.env.NODE_ENV === 'development' ? {
    host: '0.0.0.0',  // ���ǿ����������������ⷽʽ���з��ʣ�127.0.0.1��localhost, ����ip��
    port: '8888',
    contentBase: path.join(__dirname, '../dist'),
    // hot: true,  //�����ȼ���
    overlay: {  // �������ѵ���С�ڲ�
      errors: true //ֻ��ʾerror
    },
    // ��output���ö�Ӧ����
    publicPath: '/public',  // �������о�̬·����Ҫǰ���/public���ܷ������ɵľ�̬�ļ�
    historyApiFallback: {
      index: '/public/index.html' // ����404������ȫ�����ʸ������µ�url
    },
  } : undefined,
};
