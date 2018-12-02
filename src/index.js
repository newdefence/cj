import React from 'react';
import ReactDOM from 'react-dom';
import { LocaleProvider, Layout, Menu, Icon } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
import App from './Activity';
// import * as serviceWorker from './serviceWorker';

const { Sider, Content } = Layout;
const MenuItem = Menu.Item;

class Application extends React.Component {
    state = {
        collapsed: false,
    };

    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    }

    render() {
        return (<LocaleProvider locale={zh_CN}>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                    <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                    <Menu theme='dark' mode='inline'>
                        <MenuItem key='1'>
                            <Icon type='pie-chart'/>
                            <span>活动配置</span>
                        </MenuItem>
                    </Menu>
                </Sider>
                <Layout>
                    <Content style={{ padding: '8px', background: '#fff' }}>
                        <App/>
                    </Content>
                </Layout>
            </Layout>
        </LocaleProvider>);
    }
}

ReactDOM.render(<Application />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
// serviceWorker.unregister();
