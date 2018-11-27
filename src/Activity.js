import React, { Component } from 'react';
import 'whatwg-fetch';
import qs from 'qs';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Table } from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class J2 extends Component {
    save = () => {
        // e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log('err:', err);
            if (!err) {
                console.log('values:', values);
            }
        });
    }

    render() {
        const { j2 } = this.props;
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = { labelCol: 6, wrapperCol: 18 };
        return (<Modal title='新建活动信息' destroyOnClose visible={j2.visible} onOk={this.save} onCancel={() => {
            console.log('cancel');
            // this.setState({ j2: null });
        }}>
            <Form onSubmit={(e) => {
                e.preventDefault();
                this.save();
            }}>
                <FormItem {...formItemLayout} label='活动名称'>
                    {
                        getFieldDecorator('name', {
                            rules: [{ required: true, message: '抽奖活动名称必填' }],
                        })(<Input placeholder='请填写抽奖活动名称' />)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='活动红包类型'>
                    {
                        getFieldDecorator('type', {
                            initialValue: 'random',
                        })(<RadioGroup>
                            <Radio value='random'>随机金额红包</Radio>
                            <Radio value='static'>固定金额红包</Radio>
                            <Radio value='goods'>实物红包</Radio>
                        </RadioGroup>)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='红包总个数'>
                    {
                        getFieldDecorator('total', {
                            rules: [{ required: true, type: 'integer', min: 0, message: '请设置红包总个数：≥ 0' }],
                        })(<InputNumber />)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='红包总成本'>
                    {
                        getFieldDecorator('cost', {
                            rules: [{ required: true, type: 'number', min: 0, message: '请设置红包总成本：≥ 0' }],
                        })(<InputNumber />)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='活动开始时间'>
                    {
                        getFieldDecorator('startTime', {
                            rules: [{ required: true, type: 'object', message: '请设置活动开始时间' }],
                        })(<DatePicker placeholder='开始时间'/>)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='活动结束时间'>
                    {
                        getFieldDecorator('endTime', {
                            rules: [{ required: true, type: 'object', min: 0, message: '请设置活动结束时间' }],
                        })(<DatePicker placeholder='结束时间'/>)
                    }
                </FormItem>
            </Form>
        </Modal>);
    }
}

class Activity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            j1: { total: 0, data: [], current: 1, size: 20 },
            j2: null,
        };
    }
    componentDidMount() {
        fetch(`/admin/activity?${qs.stringify({ start: 0, size: 20 })}`).then(r => r.json()).then((json) => {
            this.setState({ j1: { ...this.state.j1, ...json } });
        });
    }
    render() {
        const { j1, j2 } = this.state;
        return (
            <>
                <Button onClick={() => {
                    this.setState({ j2: { visible: true } });
                }}>新建</Button>
                <Table key='_id' columns={[
                    { title: '活动名称', dataIndex: 'name' },
                    { title: '红包类型', dataIndex: 'type', render: type => ({ random: '随机金额', static: '固定金额', goods: '实物红包' }[type]) },
                    { title: '总个数', dataIndex: 'total' },
                    { title: '总成本', dataIndex: 'cost' },
                    { title: '已兑个数', dataIndex: 'checked' },
                    { title: '已兑金额', dataIndex: 'checkedCost' },
                    { title: '活动时间', key: 'startEndTime', render: (_, row) => row.startTime },
                    { title: '创建时间', key: 'createTime', render: createTime => createTime },
                ]} dataSource={j1.data} />
                {j2 ? Form.create(J2) : null}
            </>
        );
    }
}

export default Activity;
