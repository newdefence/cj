<template>
<div class="QrCodes">
    <div style="width: 80%; min-width: 750px; margin: 0 auto;">
        <h1>{{ j0.name }}</h1>
        <div>二维码个数：{{ j0.total }}，红包个数：{{ j0.count }}，总价值：{{ j0.cost }}</div>
    </div>
    <div :class="$style.codes">
        <a v-for="c in j1.data" :key="c.img" :href="c.img" target="_blank">
            <img :src="c.img" alt="二维码" :title="c.value">
            <div :class="$style.code_result">
                <template v-if="c.checkTime">{{ c.checkTime | datetime }}</template>
                <template v-else>尚未扫描</template>
            </div>
        </a>
    </div>
    <APagination v-model="j1.start" :pageSize="j1.size" :total="j1.total" hideOnSinglePage @change="loadJ1"/>
</div>
</template>

<script>
import { datetime } from '@/common';
import { generateParams } from '@/ajax';

export default {
    props: ['url'],
    data() {
        return {
            j0: {}, // 活动信息
            j1: { start: 1, size: 20, loading: false, total: 0, data: [] },
        };
    },
    filters: { datetime },
    methods: {
        loadJ1(start) {
            const vm = this;
            const { j1 } = vm;
            j1.loading = true;
            vm.$http.get(vm.url, { params: generateParams(j1, '', start) }).then(({ body: data }) => {
                if (data.success) {
                    j1.total = data.total || 0;
                    j1.data = data.data;
                    vm.j0 = data.activity;
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
};
</script>

<style lang="less" module>
.codes {
    a { float: left; width: 18%; margin: 12px 1% 0; }
    img { width: 100%; }
}
.code_result { height: 30px; line-height: 16px; }
</style>
