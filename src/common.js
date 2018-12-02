import moment from 'moment';

export const dayStartTime = (momentInstance) => {
    const ts = +momentInstance;
    // 去掉东8区时间
    return { $date: ts - (ts % (24 * 3600 * 1000)) - (8 * 3600 * 1000) };
};

export const dayEndTime = (momentInstance) => {
    const ts = +momentInstance;
    return { $date: ts - (ts % (24 * 3600 * 1000)) + ((24 * 3600 - 1 - 8 * 3600) * 1000) };
};

export const renderDate = (ts) => (ts ? moment(ts.$date).format('YYYY-MM-DD') : '');

export const renderDateTime = (ts) => (ts ? moment(ts.$date).format('YYYY-MM-DD HH:mm:ss') : '');
