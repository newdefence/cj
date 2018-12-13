<template>
<div class="Home">
    <AForm layout="inline" @submit.stop>
        <AFormItem>
            <AButton type="primary" :loading="j1.loading" @click="loadJ1(1)">查询</AButton>
        </AFormItem>
        <div class="gym-form-action">
            <AButton icon="plus" @click="m1 = { visible: true, loading: false, data: {} }">添加</AButton>
        </div>
    </AForm>
    <ATable :loading="j1.loading" :dataSource="j1.data" :rowKey="(row) => row._id.$oid" :columns="[
        { title: '活动名称', dataIndex: 'name' },
        { title: '红包类型', dataIndex: 'type', customRender: type => ACTIVITY_TYPES[type] },
        { title: '总个数', dataIndex: 'total' },
        { title: '总成本', dataIndex: 'cost' },
        { title: '已兑个数', dataIndex: 'checked' },
        { title: '已兑金额', dataIndex: 'checkedCost' },
        { title: '二维码', dataIndex: '_id', scopedSlots: { customRender: '_id' } },
        { title: '活动时间', key: 'startEndTime', scopedSlots: { customRender: 'startEndTime' } },
        { title: '创建时间', dataIndex: 'createTime', scopedSlots: { customRender: 'datetime' } },
        ]"
            :pagination="{ current: j1.start, pageSize: j1.size, total: j1.total, hideOnSinglePage: true }"
            @change="(pagination, filters, sorter)=> { loadJ1(pagination.current); }">
        <template slot="_id" slot-scope="_id">
            <a target='_blank' :href="`/admin/activity/${_id.$oid}/qrcode.html`">查看二维码</a>
        </template>
        <template slot="startEndTime" slot-scope="row">{{ row.startTime | date }} ~ {{ row.endTime | date }}</template>
        <template slot="datetime" slot-scope="ts">{{ ts | datetime }}</template>
    </ATable>
    <Insert v-if="m1" :modal="m1" @success="loadJ1(j1.start)"/>
</div>
</template>

<script type="text/jsx">
import { date, datetime, dayStartTime, dayEndTime, watchModalClose, ACTIVITY_TYPES } from '@/common';
import { generateParams } from '@/ajax';

const Insert = antd.Form.create()({
    name: 'Insert',
    props: ['modal'],
    methods: {
        save(modal, form) {
            if (!modal.loading) {
                form.validateFields((errors, values) => {
                    if (!errors) {
                        const vm = this;
                        const configHandlers = {
                            goods: lines => lines.split(/\r?\n/).map((line) => {
                                let colonIndex = line.indexOf(':');
                                if (colonIndex < 0) {
                                    colonIndex = line.indexOf('：');
                                }
                                return { count: +line.substr(0, colonIndex), value: line.substr(colonIndex + 1) };
                            }),
                            static: lines => lines.split(/r?\n/).map((line) => {
                                const [count, value] = line.split(/:|：/);
                                return { count: +count, value: +value };
                            }),
                            random: count => ({ count }),
                        };
                        modal.loading = true;
                        vm.$http.post('/admin/activity', {
                            ...values,
                            startTime: dayStartTime(values.startTime),
                            endTime: dayEndTime(values.endTime),
                            config: configHandlers[values.type](values.config),
                        }).then(({ body: json }) => {
                            if (json.success) {
                                modal.visible = false;
                                this.$emit('success');
                            } else {
                                this.$notify.warning('首页专辑配置保存失败', json.msg);
                            }
                        }, (error) => {
                            this.$notify.error('活动保存出错', error);
                        }).finally(() => {
                            modal.loading = false;
                        });
                    }
                });
            }
        },
    },
    render() {
        const vm = this;
        const { form, modal } = vm;
        const { getFieldDecorator, getFieldValue } = form;

        return <a-modal title="新建活动信息" visible={modal.visible} width={600} confirmLoading={modal.loading} onOk={() => {
            vm.save(modal, form);
        }} onCancel={() => {
            modal.visible = false;
        }} destroyOnClose>
            <a-form onSubmit={(e) => {
                e.preventDefault();
                vm.save(modal, form);
            }}>
                <a-form-item label='活动名称' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                    {
                        getFieldDecorator('name', {
                            rules: [{ required: true, message: '抽奖活动名称必填' }],
                        })(<a-input placeholder='请填写抽奖活动名称' />)
                    }
                </a-form-item>
                <a-form-item label='红包总成本' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                    {
                        getFieldDecorator('cost', {
                            rules: [{ required: true, type: 'number', min: 0, message: '请设置红包总成本：≥ 0' }],
                        })(<a-input-number addonAfter='元' />)
                    }
                </a-form-item>
                <a-form-item label='活动红包类型' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                    {
                        getFieldDecorator('type', {
                            rules: [{ required: true, message: '请设置红包类型' }],
                        })(<a-radio-group>
                            <a-radio value='random'>随机金额红包</a-radio>
                            <a-radio value='static'>固定金额红包</a-radio>
                            <a-radio value='goods'>实物红包</a-radio>
                        </a-radio-group>)
                    }
                </a-form-item>
                <a-form-item label='二维码数量' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                    {
                        getFieldDecorator('total', {
                            rules: [{ required: true, type: 'integer', min: 0, message: '请设置二维码数量：≥ 0' }],
                        })(<a-input-number placeholder='二维码总数' />)
                    }
                </a-form-item>
                {
                    getFieldValue('type') === 'random' ? <a-form-item label='红包总数' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                        {
                            getFieldDecorator('config', {
                                rules: [{ type: 'integer', required: true, min: 1, message: '请填写红包个数' }],
                            })(<a-input-number placeholder='红包个数' />)
                        }
                    </a-form-item> : null
                }
                {
                    getFieldValue('type') === 'static' ? <a-form-item label='红包金额配置' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
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
                                                        }
                                                        return `第 ${idx + 1} 行配置格式错误`;
                                                    }
                                                    return `第 ${idx + 1} 行配置不能为空`;
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
                            })(<a-textarea rows={4} placeholder={
                                ['每行格式：个数:金额，多个配置多行填写', '例如4个3元和5个1元配置格式如下：', '4:3', '5:1'].join('\n')
                            } />)
                        }
                    </a-form-item> : null
                }
                {
                    getFieldValue('type') === 'goods' ? <a-form-item label='实物配置' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
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
                                                        if (/^\d+(:|：)/.test(line)) {
                                                            return 0;
                                                        }
                                                        return `第 ${idx + 1} 行配置格式错误`;
                                                    }
                                                    return `第 ${idx + 1} 行不能为空`;
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
                            })(<a-textarea rows={4} placeholder={
                                ['每行格式：个数:货物名称，多个配置多行填写', '例如5个热水瓶和3个电风扇配置格式如下：', '5:热水瓶', '3:电风扇'].join('\n')
                            }/>)
                        }
                    </a-form-item> : null
                }
                <a-form-item label='活动开始时间' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                    {
                        getFieldDecorator('startTime', {
                            rules: [{ required: true, type: 'object', message: '请设置活动开始时间' }],
                        })(<a-date-picker placeholder='开始时间'/>)
                    }
                </a-form-item>
                <a-form-item label='活动结束时间' labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
                    {
                        getFieldDecorator('endTime', {
                            rules: [{ required: true, type: 'object', min: 0, message: '请设置活动结束时间' }],
                        })(<a-date-picker placeholder='结束时间'/>)
                    }
                </a-form-item>
            </a-form>
        </a-modal>;
    },
});

export default {
    name: 'Activity',
    data() {
        return {
            ACTIVITY_TYPES,
            j1: { start: 1, size: 20, total: 0, loading: false, data: [] },
            m1: null,
        };
    },
    watch: {
        'm1.visible': watchModalClose('m1'),
    },
    filters: {
        date,
        datetime,
    },
    methods: {
        loadJ1(start) {
            const vm = this;
            const { j1 } = vm;
            j1.loading = true;
            vm.$http.get('/admin/activity', { params: generateParams(j1, '', start) }).then(({ body: data }) => {
                if (data.success) {
                    j1.total = data.total || 0;
                    j1.data = data.data;
                } else {
                    this.$notify.warning('活动配置加载失败', data.msg);
                }
            }, (error) => {
                this.$notify.error('活动配置加载出错', error);
            }).finally(() => {
                j1.loading = false;
            });
        },
    },
    created() {
        this.loadJ1(1);
    },
    components: {
        Insert,
    },
};
</script>
