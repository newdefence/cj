import Vue from 'vue';

import { qs } from '@/libs/ajax';
import '@/libs/util';

import App from '@/views/content_audit/user_audit.vue';

// eslint-disable-next-line no-new
new Vue({
    el: '#app',
    // eslint-disable-next-line no-restricted-globals
    render: h => h(App, { attrs: { ...qs.parse(location.search) } }),
});
