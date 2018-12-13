<template>
<ALocaleProvider :locale="zh_CN">
    <ALayout style="min-height: 100vh;">
        <ALayoutSider collapsible v-model="collapsed">
            <div class="logo"></div>
            <Menus theme="dark" :tab="tab" :defaultOpenKeys="defaultOpenKeys"/>
        </ALayoutSider>
        <ALayout>
            <ALayoutHeader>
                <AIcon :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="collapsed = !collapsed"/>
            </ALayoutHeader>
            <ALayoutContent style="padding: 8px; background: #fff;">
                <router-view/>
            </ALayoutContent>
        </ALayout>
    </ALayout>
</ALocaleProvider>
</template>

<script type="text/jsx">
// eslint-disable-next-line camelcase
import zh_CN from 'antd_locale-provider_zh-cn'; // import zh_CN from 'ant-design-vue/es/locale-provider/zh_CN';

const menus = [
    { icon: 'home', url: '/', name: '首页' },
    {
        icon: 'video-camera',
        title: '内容管理',
        children: [
            { icon: 'cloud-upload', url: '/content/upload', name: '上传管理' },
            { icon: 'table', url: '/content/playlist', name: '专辑管理' },
        ],
    },
];

export default {
    name: 'App',
    data() {
        return {
            zh_CN,
            collapsed: false,
            tab: '/',
            tabs: [],
            defaultOpenKeys: [],
        };
    },
    components: {
        Menus: {
            props: ['tab', 'defaultOpenKeys'],
            /* eslint-disable indent */
            render() {
                const vm = this;
                return (<a-menu mode="inline" onSelect={($event) => {
                    vm.$router.push($event.key);
                }} selectedKeys={[vm.tab]} defaultOpenKeys={vm.defaultOpenKeys}>
                    {
                        menus.map(m1 => (m1.children ? <a-sub-menu key={m1.title}>
                            <template slot="title">
                            <a-icon type={m1.icon}/>
                            <span>{m1.title}</span>
                            </template>
                            {
                                m1.children.map(m2 => <a-menu-item key={m2.url}>
                                    <a-icon type={m2.icon}/>
                                    <span>{m2.name}</span>
                                </a-menu-item>)
                            }
                        </a-sub-menu> : <a-menu-item key={m1.url}>
                            <a-icon type={m1.icon}/>
                            <span>{m1.name}</span>
                        </a-menu-item>))
                    }
                </a-menu>);
            },
            /* eslint-enable */
        },
    },
    methods: {
        // pushRoute($event) {
        //     // console.log('$event', $event);
        //     this.tab = $event.key;
        //     this.$router.push($event.key);
        // },
        tryPushTab(to) {
            const vm = this;
            const { tabs } = vm;
            const { path } = to;
            let tab;
            menus.forEach((m1) => {
                if (m1.url === path) {
                    tab = m1;
                } else if (m1.children) {
                    m1.children.forEach((m2) => {
                        if (m2.url === path) {
                            tab = m2;
                        }
                    });
                }
            });
            // const tab = menus.find(m => m.url === path);
            if (tab) {
                vm.tab = tab.url;
                if (!tabs.some(t => path === t.url)) {
                    tabs.push(tab);
                }
            }
        },
        tryRemoveTab(targetKey, action) {
            if (action === 'remove') {
                const vm = this;
                const { tabs } = vm;
                let tabIdx, nextTab;
                if (vm.tab === targetKey) {
                    tabIdx = tabs.findIndex(t => t.url === targetKey);
                    nextTab = tabs[tabIdx + 1] || tabs[tabIdx - 1];
                    if (nextTab) {
                        vm.tab = nextTab.url;
                        vm.$router.push(nextTab.url);
                    }
                }
                vm.tabs = tabs.filter(t => t.url !== targetKey);
            }
        },
    },
    created() {
        const vm = this;
        const hash = location.hash.replace(/#/, '');
        const defaultOpenKeys = [];
        let matchedRoute;
        for (let idx = 0, m1, idx2, m2; idx < menus.length; idx += 1) {
            m1 = menus[idx];
            if (hash === m1.url) {
                matchedRoute = m1;
            } else if (m1.children) {
                for (idx2 = 0; idx2 < m1.children.length; idx2 += 1) {
                    m2 = m1.children[idx2];
                    if (m2.url === hash) {
                        matchedRoute = m2;
                        defaultOpenKeys.push(m1.title);
                        break;
                    }
                }
            }
            if (matchedRoute) {
                break;
            }
        }
        if (!matchedRoute) {
            [matchedRoute] = menus;
        }
        vm.defaultOpenKeys = defaultOpenKeys;
        vm.tab = matchedRoute.url;
        vm.tabs = [matchedRoute];
        vm.$router.afterEach((to) => {
            vm.tryPushTab(to);
        });
    },
};
</script>

<style lang="less">
.ant-layout-sider {
    background: #fff;
    .logo { height: 32px; margin: 16px; background: rgba(255, 255, 255, 0.2); }
}
// .ant-menu-inline-collapsed { width: 60px; }
.ant-layout-header { color: #fff; background: #1890ff; }
.ant-layout-content { margin: 10px 10px 0; background: #fff; }
.ant-layout-content > .ant-tabs > .ant-tabs-bar { background: #f0f2f5; }
// 重置部分代码
.gym-form-inline {
    padding: 10px 0;
    .ant-form-item-control { min-width: 150px; }
}
.ant-form-item { margin-bottom: 10px; }
.ant-form-item-label { padding-right: 10px; line-height: 30px; }
.ant-form-item-control { line-height: 30px; }
.gym-form-action {
    float: right; line-height: 40px;
    .ant-btn { color: #fff; background: #13c2c2; }
    button + button { margin-left: 15px; }
}
.ant-drawer-body { padding: 10px 15px; }
// 自己补充的 css
.ant-drawer-footer {
    margin-top: 12px; text-align: right;
    .ant-btn + .ant-btn { margin-left: 20px; }
}
.ant-modal {
    h3 { padding: 0 20px; font-size: 15px; line-height: 30px; color: #1890ff; background: #e6f7ff; border-bottom: 1px solid; }
}
.ant-modal-body { padding: 10px 15px; }
.ant-table {
    .ant-btn { height: 30px; padding: 0 10px; }
    .ant-btn + .ant-btn { margin-left: 12px; }
}
.ant-table-thead > tr > th { padding: 8px 0; }
.ant-table-tbody > tr > td { padding: 6px 2px; }
.ant-col-8.ant-col-offset-1 { text-align: center; }
.ant-col-8 img { max-width: 100%; max-height: 90px; }
</style>
