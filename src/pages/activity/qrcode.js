import Vue from 'vue';

import App from '@/views/activity/QrCodes.vue';

// document.title = '活动二维码详情';

// eslint-disable-next-line no-new
new Vue({
    el: '#app',
    // eslint-disable-next-line no-restricted-globals
    render: h => h(App, { attrs: { url: location.pathname.replace(/\.html$/, '') } }),
});
