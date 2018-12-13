<template>
<ALocaleProvider :locale="zh_CN">
    <ALayout style="min-height: 100vh;">
        <ALayoutSider collapsible v-model="collapsed">
            <div class="logo"></div>
            <SiderMenu theme="dark" :defaultSelectedKeys="defaultSelectedKeys" :defaultOpenKeys="defaultOpenKeys"/>
        </ALayoutSider>
        <ALayout>
            <ALayoutHeader>
                <AIcon :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="collapsed = !collapsed"/>
            </ALayoutHeader>
            <ALayoutContent>
                <router-view/>
            </ALayoutContent>
        </ALayout>
    </ALayout>
</ALocaleProvider>
</template>

<script type="text/jsx">
// eslint-disable-next-line camelcase
import zh_CN from 'antd_locale-provider_zh-cn'; // import zh_CN from 'ant-design-vue/es/locale-provider/zh_CN';

import { SIDER_MENUS } from './resources';

export default {
    name: 'App',
    data() {
        return {
            zh_CN,
            collapsed: false,
            defaultSelectedKeys: [],
            defaultOpenKeys: [],
        };
    },
    components: {
        SiderMenu: {
            props: ['defaultSelectedKeys', 'defaultOpenKeys'],
            /* eslint-disable indent */
            render() {
                const vm = this;
                return (<a-menu mode="inline" defaultSelectedKeys={vm.defaultSelectedKeys} defaultOpenKeys={vm.defaultOpenKeys} onSelect={(e) => {
                    vm.$router.push(e.key);
                }}>
                    {
                        SIDER_MENUS.map(m1 => (m1.children ? <a-sub-menu key={m1.path}>
                            <template slot="title">
                            <a-icon type={m1.icon}/>
                            <span>{m1.title}</span>
                            </template>
                            {
                                m1.children.map(m2 => <a-menu-item key={m2.path}>
                                    <a-icon type={m2.icon}/>
                                    <span>{m2.name}</span>
                                </a-menu-item>)
                            }
                        </a-sub-menu> : <a-menu-item key={m1.path}>
                            <a-icon type={m1.icon}/>
                            <span>{m1.name}</span>
                        </a-menu-item>))
                    }
                </a-menu>);
            },
            /* eslint-enable */
        },
    },
    created() {
        const vm = this;
        const { matched } = vm.$route;
        let defaultSelectedMenu;
        let defaultOpenMenu;
        if (matched.length) {
            const entryRoutePath = matched[0].path;
            SIDER_MENUS.some((m1) => {
                if (m1.path === entryRoutePath) {
                    defaultSelectedMenu = m1;
                    return true;
                }
                if (m1.children) {
                    return m1.children.some((m2) => {
                        if (m2.path === entryRoutePath) {
                            defaultSelectedMenu = m2;
                            defaultOpenMenu = m1;
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            });
        }
        if (!defaultSelectedMenu) {
            const [firstMenu] = SIDER_MENUS;
            if (firstMenu.children) {
                defaultOpenMenu = firstMenu;
                defaultSelectedMenu = firstMenu.children[0];
            } else {
                defaultSelectedMenu = firstMenu;
            }
            vm.$router.push(defaultSelectedMenu.path);
        }
        vm.defaultSelectedKeys = [defaultSelectedMenu.path];
        if (defaultOpenMenu) {
            vm.defaultOpenKeys = [defaultOpenMenu.path];
        }
    },
};
</script>

<style lang="less">
.ant-layout-sider {
    background: #fff;
    .logo { height: 32px; margin: 16px; background: rgba(255, 255, 255, 0.2); }
}
// .ant-menu-inline-collapsed { width: 60px; }
.ant-layout-header { color: #fff; }
.ant-layout-content { padding: 8px; margin: 10px 10px 0; background: #fff; }
// 重置部分代码
.ant-form-item { margin-bottom: 10px; }
.ant-form-item-label { padding-right: 10px; line-height: 30px; }
.ant-form-item-control { line-height: 30px; }
.ant-input { height: 30px; }
.ant-input-number { width: 171px; height: 30px; }
.ant-input-number-input { height: 28px; }
.ant-calendar-picker-input { widows: 171px; }
// 自定义扩展
.ant-form-inline {
    .ant-form-item-control { min-width: 150px; }
}
.gym-form-action {
    float: right;
    .ant-btn { border-color: #13c2c2; color: #fff; background: #13c2c2; }
    button + button { margin-left: 15px; }
}
.ant-drawer-body { padding: 10px 15px; }
// 自己补充的 css
.ant-drawer-footer {
    margin-top: 12px; text-align: right;
    .ant-btn + .ant-btn { margin-left: 20px; }
}
.ant-modal {
    h3 { padding: 0 20px; border-bottom: 1px solid; font-size: 15px; line-height: 30px; color: #1890ff; background: #e6f7ff; }
}
.ant-modal-body { padding: 10px 15px; }
.ant-form + .ant-table-wrapper { margin-top: 12px; }
.ant-table {
    .ant-btn { height: 30px; padding: 0 10px; }
    .ant-btn + .ant-btn { margin-left: 12px; }
}
.ant-table-thead > tr > th { padding: 8px 0; }
.ant-table-tbody > tr > td { padding: 6px 1px 6px 4px; }
.ant-col-8.ant-col-offset-1 { text-align: center; }
.ant-col-8 img { max-width: 100%; max-height: 90px; }
</style>
