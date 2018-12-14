// import Vue from 'vue';

// Send request body as application/x-www-form-urlencoded content type
// Vue.http.interceptors.push((request, next) => {
//     next((response) => {
//         // ...
//         // 请求发送后的处理逻辑
//         // ...
//         if (response.status === 200 && response.body && response.body.error_code === 401) {
//             // 需要登陆
//             // router.push('/login');
//             Vue.cookies.remove('nickname');
//             // eslint-disable-next-line no-restricted-globals
//             location.href = '/login.html';
//         } else if (response.status === 0 && !response.ok) {
//             if (!response.message) {
//                 iView.Message.error('网络请求失败');
//             } else {
//                 iView.Message.error(response.message);
//             }
//         }
//         return response;
//     });
// });

export const qs = {
    parse(search) {
        // NOTE 只解析一层，嵌套结构自己去处理，不解析数组
        const json = {};
        search.replace(/\?/, '').split('&').forEach((kv) => {
            const [k, v] = kv.split('=').map(s => decodeURIComponent(s || ''));
            if (k) {
                json[k] = v;
                // try {
                //     // 此方法内部用用即可，纯粹的是为了解析方便，有大量的代码注入风险，不要公开使用；
                //     // eslint-disable-next-line no-new-func
                //     json[k] = Function(`return ${v};`)();
                // } catch (e) {
                //     json[k] = v;
                // }
            }
        });
        return json;
    },
    stringify(obj) {
        // NOTE 不处理 null 和 undefined，不处理嵌套结构
        return Object.entries(obj)
            .filter(([, v]) => v == null)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .json('&');
    },
};


// keys 格式：mustKey1,mustKey2,mustKey3|optionKey1,optionKey2,optionKey3|startEndTime
// start: 分页页码
export const generateParams = (source, keys, start) => {
    const params = {};
    const [mustKeys, optionKeys, startEndTime] = keys.split('|');
    if (mustKeys) {
        mustKeys.split(',').forEach((key) => {
            params[key] = source[key];
        });
    }
    if (optionKeys) {
        optionKeys.split(',').forEach((key) => {
            const value = source[key];
            if (value !== undefined && value !== null) {
                params[key] = value;
            }
        });
    }
    if (startEndTime && source.startEndTime) {
        [params.startTime, params.endTime] = source.startEndTime;
    }
    if (start) {
        if (source.start !== start) {
            source.start = start;
        }
        params.start = start;
        params.size = source.size;
    }
    return params;
};
