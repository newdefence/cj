import React, { Component } from 'react';
import axios from 'axios';
import { Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Table } from 'antd';

import { dayStartTime, dayEndTime, renderDate, renderDateTime } from './common';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;

class J2 extends Component {
    onOk = () => {
        // e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log('onOk: err, values =>', err, values);
            if (!err) {
                const configHandlers = {
                    goods: lines => lines.split(/\r?\n/).map(line => {
                        let colonIndex = line.indexOf(':');
                        if (colonIndex < 0) {
                            colonIndex = line.indexOf('：');
                        }
                        return { count: +line.substr(0, colonIndex), value: line.substr(colonIndex + 1) }
                    }),
                    static: lines => lines.split(/r?\n/).map(line => {
                        const [count, value] = line.split(/:|：/);
                        return { count: +count, value: +value };
                    }),
                    random: count => ({ count }),
                }
                this.props.onOk({
                    ...values,
                    startTime: dayStartTime(values.startTime),
                    endTime: dayEndTime(values.endTime),
                    config: configHandlers[values.type](values.config),
                });
            }
        });
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
        // const total = getFieldValue('total');
        // const cost = getFieldValue('cost');
        return (<Modal title='新建活动信息' destroyOnClose visible={props.visible} confirmLoading={props.confirmLoading}
            onOk={this.onOk} onCancel={props.onCancel}>
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
                <FormItem {...formItemLayout} label='二维码数量'>
                    {
                        getFieldDecorator('total', {
                            rules: [{ required: true, type: 'integer', min: 0, message: '请设置二维码数量：≥ 0' }],
                        })(<InputNumber placeholder='二维码总数' />)
                    }
                </FormItem>
                {
                    getFieldValue('type') === 'random' ? <FormItem {...formItemLayout} label='红包总数'>
                        {
                            getFieldDecorator('config', {
                                rules: [ { type: 'integer', required: true, min: 1, message: '请填写红包个数' } ],
                            })(<InputNumber placeholder='红包个数' />)
                        }
                    </FormItem> : null
                }
                {
                    getFieldValue('type') === 'static' ? <FormItem {...formItemLayout} label='红包金额配置'>
                        {
                            getFieldDecorator('config', {
                                validateTrigger: 'onBlur',
                                rules: [
                                    {
                                        validator(rule, value, callback) {
                                            if (value) {
                                                const lines = value.split(/\r?\n/);
                                                const errors = lines.map((line, idx) => {
                                                    line = line.trim();
                                                    if (line) {
                                                        // 只做简单的格式校验，不对数据的合法性做校验（大小，正负，小数等）
                                                        if (/^\d+(:|：)\d+(\.\d+)?$/.test(line)) {
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
                                                } else {
                                                    callback();
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
                                validateTrigger: 'onBlur',
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
                                                } else {
                                                    callback();
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

const ACTIVITY_TYPES = { random: '随机金额', static: '固定金额', goods: '实物红包' };

class Activity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            j1: { total: 0, data: [], current: 1, size: 20, loading: true },
            j2: null,
        };
    }
    componentDidMount() {
        this.loadJ1(1);
    }

    loadJ1 = (current) => {
        const { j1 } = this.state;
        const newJ1 = { ...j1, loading: true };
        if (j1.current !== current) {
            newJ1.current = current;
        }
        this.setState({ j1: newJ1 });
        axios('/admin/activity', { params: { current, size: 20 } }).then(({ data }) => {
            this.setState({ j1: { ...newJ1, loading: false, ...data } });
        });
    }

    saveJ2 = (data) => {
        this.setState({ j2: { ...this.state.j2, confirmLoading: true } });
        axios.post('/admin/activity', data).then(({ data: json }) => {
            if (json.success) {
                this.loadJ1(1);
                this.closeJ2();
            }
        }, (error) => {
            console.log('error:', error);
        }).finally(() => {
            this.setState({ j2: { ...this.state.j2, confirmLoading: false } });
        });
    }

    closeJ2 = () => {
        this.setState({ j2: { ...this.state.j2, visible: false } });
        setTimeout(() => {
            this.setState({ j2: null });
        }, 600);
    }

    render() {
        const { j1, j2 } = this.state;
        return (
            <>
                <div className='ant-row'>
                    <Button type='primary' style={{ float: 'right' }} onClick={() => {
                        this.setState({ j2: { visible: true, confirmLoading: false } });
                    }}>新建</Button>
                </div>
                <Table rowKey={(row) => row._id.$oid} columns={[
                    { title: '活动名称', dataIndex: 'name' },
                    { title: '红包类型', dataIndex: 'type', render: type => ACTIVITY_TYPES[type] },
                    { title: '总个数', dataIndex: 'total' },
                    { title: '总成本', dataIndex: 'cost' },
                    { title: '已兑个数', dataIndex: 'checked' },
                    { title: '已兑金额', dataIndex: 'checkedCost' },
                    { title: '活动时间', key: 'startEndTime', render: (_, row) => `${renderDate(row.startTime)} ~ ${renderDate(row.endTime)}` },
                    { title: '创建时间', dataIndex: 'createTime', render: ts => renderDateTime(ts) },
                ]} dataSource={j1.data} />
                {j2 ? <J2From {...j2} onOk={this.saveJ2} onCancel={this.closeJ2}/> : null}
            </>
        );
    }
}

export default Activity;
