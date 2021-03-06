const path = require('path');
// const webpack = require("webpack");
// const HtmlWebpackPlugin = require('html-webpack-plugin');

const pages = {
    index: { entry: 'src/main.js', title: '后台系统' },
    audit: { entry: 'src/pages/activity/qrcode.js', filename: 'activity/qrcode.html', title: '活动二维码详情' },
    // login: { entry: 'src/pages/login.js', title: '欢迎登录 FineChat 后台系统', chunks: ['chunk-vendors', 'login'] },
};

module.exports = {
    baseUrl: process.env.NODE_ENV === 'development' ? '/' : '/static/dist/',
    outputDir: 'dist', // 相对于 static，实际效果是 static/dist/
    // 生成环境默认是 outputDir(=static/dist)/index.html，nginx 主页路由到 static/dist/index.html
    // indexPath: process.env.NODE_ENV === 'development' ? 'index.html' : path.resolve(__dirname, 'index.html'),
    pages,
    chainWebpack(config) {
        config.plugins.delete('prefetch');
        config.plugins.delete('preload');
        Object.keys(pages).forEach((page) => {
            config.plugins.delete(`prefetch-${page}`);
            config.plugins.delete(`preload-${page}`);
        });
        // config.module.rule('images').use('url-loader').tap((options) => {
        //     options.limit = 1024 * 2;
        //     return options;
        // });
    },
    configureWebpack(config) {
        config.devtool = process.env.NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : false;
        config.externals = {
            'ant-design-vue': 'antd',
            '../moment': 'moment',
            moment: 'moment',
            vue: 'Vue',
            'vue-router': 'VueRouter',
        };
    },
    devServer: {
        index: 'index.html',
        contentBase: [__dirname, path.resolve(__dirname, '../')],
        historyApiFallback: {
            rewrites: [
                { from: /^\/activity\/(\w+)\/qrcode\.html$/, to: '/activity/qrcode.html' },
                { from: /^.*?\.html$/, to: '/index.html' },
            ],
        },
        proxy: {
            // '(?!\\.(js|html|png|jpg|svg|woff|ttf|woff2|map|ico|json))': { target: 'http://gateway' },
            '^(/\\w+)+$': { target: 'http://localhost:8999' },
            '^/blog/.*?(?!\\.html$)': { target: 'http://xxx', headers: { Host: 'xxx.com', Origin: 'http://localhost:8100' } },
            '/static': { target: 'http://localhost:8999' },
        },
    },
};
