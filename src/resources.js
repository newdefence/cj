import Activity from './views/activity/List.vue';
import Goods from './views/Goods.vue';

export default [
    { path: '/activity/list.html', component: Activity },
    { path: '/activity/goods.html', component: Goods },
];

export const SIDER_MENUS = [
    { icon: 'home', path: '/', name: '首页' },
    {
        icon: 'video-camera',
        path: '/activity/',
        title: '抽奖配置',
        children: [
            { icon: 'gift', path: '/activity/goods.html', name: '实物列表' },
            { icon: 'table', path: '/activity/list.html', name: '活动配置' },
        ],
    },
];
