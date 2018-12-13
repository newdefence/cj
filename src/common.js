import moment from 'moment';

export const watchModalClose = (modelKey, others) => function watchModalVisible(visible) {
    const vm = this;
    if (!visible && vm[modelKey]) {
        setTimeout(() => {
            vm[modelKey] = null;
            if (others) {
                others.split(',').forEach((key) => {
                    vm[key] = null;
                });
            }
        }, 1000);
    }
};

export const dayStartTime = (momentInstance) => {
    const ts = +momentInstance;
    // 去掉东8区时间
    return { $date: ts - (ts % (24 * 3600 * 1000)) - (8 * 3600 * 1000) };
};

export const dayEndTime = (momentInstance) => {
    const ts = +momentInstance;
    return { $date: ts - (ts % (24 * 3600 * 1000)) + ((24 * 3600 - 1 - 8 * 3600) * 1000) };
};

export const date = (ts, defaultValue) => (ts ? moment(ts.$date).format('YYYY-MM-DD') : defaultValue);

export const datetime = (ts, defaultValue) => (ts ? moment(ts.$date).format('YYYY-MM-DD HH:mm:ss') : defaultValue);

export const ACTIVITY_TYPES = { random: '随机金额', static: '固定金额', goods: '实物红包' };
