// import '@babel/polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';
import 'moment/src/locale/zh-cn';
// import antd from 'ant-design-vue';
// Vue.use(antd);
import App from './App.vue';
import routes from './resources';
// Vue.config.productionTip = false;

// eslint-disable-next-line no-new
const app = new Vue({
    el: '#app',
    router: new VueRouter({
        mode: 'history',
        routes,
    }),
    render: h => h(App),
});

Vue.prototype.$notify = {
    warning(title, msg, description) {
        app.$notification.warning({ message: title, description: msg || `${description || title}，请联系开发人员` });
    },
    error(title, error) {
        app.$notification.error({
            message: title,
            description: (h) => {
                const { response } = error;
                if (response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    return h('div', {}, ['请把以下信息提供给开发人员！', h('br'), `status: ${response.status}`, h('br'), JSON.stringify(response.data)]);
                    // console.log(error.response.data);
                    // console.log(error.response.status);
                    // console.log(error.response.headers);
                }
                if (error.request) {
                    return h('div', {}, ['服务器暂无响应！', h('br'), '请检查网络设置，或者联系开发人员!']);
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    // console.log(error.request);
                } // else {
                // Something happened in setting up the request that triggered an Error
                return h('div', {}, ['未知错误，请联系开发人员！', h('br'), error.message]);
                // console.log('Error', error.message);
                // }
            },
        });
    },
};
