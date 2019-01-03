# coding=utf-8

from datetime import datetime

from tornado.web import authenticated, RequestHandler, HTTPError
from tornado.gen import coroutine

from bson import ObjectId
from bson.json_util import dumps, loads

from base import AuthBaseHandler

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/12/17 下午5:55:00"

# TODO： 有时间需要做 json_schema 验证

class GoodsHandler(AuthBaseHandler):
    @coroutine
    @authenticated
    def get(self, *args, **kwargs):
        # where = filter
        _aid, _match = self.get_query_argument('activity_id', None), {}
        if _aid:
            _match = {'activity': ObjectId(_aid)}
        total = yield self.db.goods.count_documents(_match)
        cursor = self.db.goods.aggregate([v for (b, v) in [
            (_match, {'$match': _match}),
            (self.offset, {'$skip', self.offset}),
            (1, {'$limit': self.size}),
            (1, {'$lookup': {'from': 'activity', 'localField': 'activity', 'foreignField': '_id', 'as': '_activityList'}}),
            # (1, {'$replaceRoot': {'newRoot': {'$mergeObjects': [{'$arrayElemAt': ['$activity0', 0]}, '$$ROOT']}}}),
            # (1, {'$project': {'activity': {'$replaceRoot': {'newRoot': {'activityName': {'$arrayElemAt': ['$activity0',0]}}} }}}),
            (1, {'$project': {'activity': {'$arrayElemAt': ['_activityList', 0]}, '_id': 1, 'name': 1, '...otherFieldTypes': 1}}),
            (1, {'$project': {'activity._id': 1, 'activity.name': 1}}),

        ] if b])

        # if self.offset:
        #     cursor.skip(self.offset)
        # cursor.limit(self.size)
        data = yield cursor.to_list(length=None)
        self.finish_bson(total=total, data=data)

    @coroutine
    @authenticated
    def post(self):
        """设置红包活动信息
        total: 总个数, checked: 已兑金额, checkedCost: 已兑个数, secret: random(1)(createTime).toString(36)
        1. 随机红包: { type: random, count: 总个数, cost: 总价值, config: { count: 总个数 } }
        2. 固定金额红包: { type: static, count: 总个数, cost: 总价值, config: [{ value: 1, count: 10 }, { value:2, count: 3 }] },
        3. 实物奖励: { type: goods, count, cost, config: [{ value, name, count }, ...]
        """
        activity, user = self.bson, self.current_user
        cost, _type, _config = activity['cost'], activity['type'], activity['config']
        if _type not in ('random', 'static', 'goods'):
            raise HTTPError(401)
        patch, now = [], datetime.now()
        if _type == 'random':
            count, cost_inc = _config['count'], 0
            one = int(cost * 100.0 / count) / 100.0
            # 精确到2位小数,两两的计算,即便如此，浮点数的各种问题也是无法避免。例如 5-1.07, 5-3.93 的问题
            while count > 0:
                if count > 1:
                    diff = int(100 * one * random.random()) / 100.0
                    cost_inc = cost_inc + one + diff
                    patch.append({'type': 'random', 'seq': count, 'value': one + diff})
                    if count == 2:
                        patch.append({'type': 'random', 'seq': 1, 'value': cost - cost_inc})
                    else:
                        cost_inc = cost_inc + one - diff
                        patch.append({'type': 'random', 'seq': count - 1, 'value': one - diff})
                elif count == 1:
                    patch.append({'type': 'random', 'seq': count, 'value': cost - cost_inc})
                count = count - 2
        elif _type == 'static':
            seq = 1
            for kv in _config:
                patch += [{'type': 'static', 'seq': seq + i, 'value': kv['value']} for i in range(0, kv['count'])]
                seq += kv['count']
        elif _type == 'goods':
            seq = 1
            for kv in _config:
                patch += [{'type': 'goods', 'seq': seq + i, 'value': kv['value']} for i in range(0, kv['count'])]
                seq += kv['count']
        else:
            raise HTTPError(401)
        really_count = len(patch)
        activity.update(createTime=datetime.now(), createUser=user, count=really_count, checkCount=0, checkCost=0)
        result = yield self.db.activity.insert_one(activity)
        activity_id = result.inserted_id
        for p in patch:
            p.update(activity=activity_id, createTime=now, createUser=user, startTime=activity['startTime'], endTime=activity['endTime'])
        if really_count < activity['total']:
            patch += [dict(type=_type, seq=seq + really_count, value=0, activity=activity_id, createTime=now, createUser=user,
                           startTime=activity['startTime'],  endTime=activity['endTime']) for seq in range(really_count, activity['total'])]
        # 随机打乱顺序；
        random.shuffle(patch)
        result = yield self.db.package.insert_many(patch, False)
        self.finish_bson(_id=activity_id, patch=result.inserted_ids, msg='红包活动创建成功')

