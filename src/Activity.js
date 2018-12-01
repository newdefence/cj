import React, { Component } from 'react';
import 'whatwg-fetch';
import qs from 'qs';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Table } from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

class J2 extends Component {
    onOk = () => {
        // e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log('onOk: err, values =>', err, values);
            if (!err) {
                this.props.onOk(values);
            }
        });
    }

    onCancel = () => {
        console.log('onCancel')
        this.props.onCancel();
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.onOk();
    }

    render() {
        const { props } = this;
        const { form } = props;
        const { getFieldDecorator, getFieldValue } = form;
        const formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
        const total = getFieldValue('total');
        const cost = getFieldValue('cost');
        return (<Modal title='新建活动信息' destroyOnClose visible={props.visible} onOk={this.onOk} onCancel={this.onCancel}>
            <Form onSubmit={this.onSubmit}>
                <FormItem {...formItemLayout} label='活动名称'>
                    {
                        getFieldDecorator('name', {
                            rules: [{ required: true, message: '抽奖活动名称必填' }],
                        })(<Input placeholder='请填写抽奖活动名称' />)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='红包总成本'>
                    {
                        getFieldDecorator('cost', {
                            rules: [{ required: true, type: 'number', min: 0, message: '请设置红包总成本：≥ 0' }],
                        })(<InputNumber />)
                    }
                </FormItem>
                <FormItem {...formItemLayout} label='活动红包类型'>
                    {
                        getFieldDecorator('type', {
                            rules: [{ required: true, message: '请设置红包类型' }],
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
                        })(<InputNumber placeholder='总个数' />)
                    }
                </FormItem>
                {
                    getFieldValue('type') === 'random' ? <FormItem {...formItemLayout} label='随机浮动范围'>
                        {
                            getFieldDecorator('config', {
                                rules: [ { type: 'number', min: 0, message: '请设置正确的浮动范围' } ],
                            })(<InputNumber placeholder={(cost && total) ? `± ${(cost/total).toFixed(2)}` : ''} />)
                        }
                    </FormItem> : null
                }
                {
                    getFieldValue('type') === 'static' ? <FormItem {...formItemLayout} label='红包金额配置'>
                        {
                            getFieldDecorator('config', {
                                rules: [
                                    {
                                        validator(rule, value, callback) {
                                            if (value) {
                                                const lines = value.split(/\r?\n/);
                                                const errors = lines.map((line, idx) => {
                                                    line = line.trim();
                                                    if (line) {
                                                        // 只做简单的格式校验，不对数据的合法性做校验（大小，正负，小数等）
                                                        if (/^\d+(:|：)\d+$/.test(line)) {
                                                            return 0;
                                                        } else {
                                                            return `第 ${idx + 1} 行配置格式错误`;
                                                        }
                                                    } else {
                                                        return `第 ${idx + 1} 行配置不能为空`;
                                                    }
                                                }).filter(Boolean);
                                                if (errors.length) {
                                                    callback(errors[0]);
                                                }
                                            } else {
                                                callback('请填写配置');
                                            }
                                        },
                                    },
                                ],
                            })(<TextArea rows={4} placeholder={
                                ['每行格式：个数:金额，多个配置多行填写', '例如4个3元和5个1元配置格式如下：', '4:3', '5:1'].join('\n')
                            } />)
                        }
                    </FormItem> : null
                }
                {
                    getFieldValue('type') === 'goods' ? <FormItem {...formItemLayout} label='实物配置'>
                        {
                            getFieldDecorator('config', {
                                rules: [
                                    {
                                        validator(rule, value, callback) {
                                            if (value) {
                                                const lines = value.split(/\r?\n/);
                                                const errors = lines.map((line, idx) => {
                                                    line = line.trim();
                                                    if (line) {
                                                        if (/^\d+(:|：)/.test(line)){
                                                            return 0;
                                                        } else {
                                                            return `第 ${idx + 1} 行配置格式错误`;
                                                        }
                                                    } else {
                                                        return `第 ${idx + 1} 行不能为空`;
                                                    }
                                                }).filter(Boolean);
                                                if (errors.length) {
                                                    callback(errors[0]);
                                                }
                                            } else {
                                                callback('请配置实物');
                                            }
                                        },
                                    },
                                ],
                            })(<TextArea rows={4} placeholder={
                                ['每行格式：个数:货物名称，多个配置多行填写', '例如5个热水瓶和3个电风扇配置格式如下：', '5:热水瓶', '3:电风扇'].join('\n')
                            }/>)
                        }
                    </FormItem> : null
                }
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

const J2From = Form.create()(J2);

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

    saveJ2 = (j2Config) => {
        const { j2 } = this.state;
        console.log('TODO: save j2', j2Config, j2);
        this.closeJ2();
    }

    closeJ2 = () => {
        const { j2 } = this.state;
        this.setState({ j2: { ...j2, visible: false } });
        setTimeout(() => {
            this.setState({ j2: null });
        }, 600);
    }

    render() {
        const { j1, j2 } = this.state;
        return (
            <>
                <Button onClick={() => {
                    this.setState({ j2: { visible: true, data: {} } });
                }}>新建</Button>
                <Table rowKey={(row) => row._id.$oid} columns={[
                    { title: '活动名称', dataIndex: 'name' },
                    { title: '红包类型', dataIndex: 'type', render: type => ({ random: '随机金额', static: '固定金额', goods: '实物红包' }[type]) },
                    { title: '总个数', dataIndex: 'total' },
                    { title: '总成本', dataIndex: 'cost' },
                    { title: '已兑个数', dataIndex: 'checked' },
                    { title: '已兑金额', dataIndex: 'checkedCost' },
                    { title: '活动时间', key: 'startEndTime', render: (_, row) => row.startTime },
                    { title: '创建时间', key: 'createTime', render: createTime => createTime },
                ]} dataSource={j1.data} />
                {j2 ? <J2From visible={j2.visible} data={j2.data} onOk={this.saveJ2} onCancel={this.closeJ2}/> : null}
            </>
        );
    }
}

export default Activity;
