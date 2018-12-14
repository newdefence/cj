# coding=utf-8

from datetime import datetime
import math
import random

from tornado.web import authenticated, RequestHandler, HTTPError
from tornado.gen import coroutine

from bson import ObjectId
from bson.json_util import dumps, loads
import pymongo

import qrcode

import py.config as config
import py.crypt as crypt

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/11/20 下午9:50:00"

# TODO： 有时间需要做 json_schema 验证

UID_KEY = 'uid'

BASE62 = 'qwertyuiopasdfghjklzxcvbnm1234567890MNBVCXZLKJHGFDSAPOIUYTREWQ'


def base62(num):
    if num < 62:
        return BASE62[num]
    return base62(num / 62) + BASE62[num % 62]


# BASE8 = '01234567'
# def base8(num):
#     if num < 8:
#         return BASE8[num]
#     return base8(num / 8) + BASE8[num % 8]

# BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz'
# def base36(num):
#     if num < 36:
#         return BASE36[num]
#     return base36(num / 36) + BASE36[num % 36]

# 二维码生成格式：.../qrcode/[ObjectId -> ts -> 62进制]-[sha1(ObjectId-SECRET):8]


class LoginHandler(RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def get(self):
        if self.application.settings['debug']:
            self.set_secure_cookie(UID_KEY, 'TEST_USER')
            self.finish({'success': True, 'msg': '登录成功'})
        else:
            raise HTTPError(404)

    def post(self):
        user = loads(self.request.body)
        self.set_secure_cookie(UID_KEY, user['name'])
        self.finish({'success': True, 'msg': '登录成功'})

    def put(self):
        self.clear_cookie(UID_KEY)
        self.finish({'success': True, 'msg': '退出成功'})



class AuthBaseHandler(RequestHandler):
    bson = None
    offset = 0
    size = 20
    keyword = None

    def check_xsrf_cookie(self):
        pass

    @property
    def db(self):
        return self.application.settings['db']

    def get_current_user(self):
        return 'TestUser'

    def prepare(self):
        if self.request.method == 'GET':
            start, size, self.keyword = [self.get_query_argument(key, None) for key in ("start", "size", "keyword")]
            if size and size != '20' and size.isdigit():
                self.size = int(size)
            if start and start != '1' and start.isdigit():
                self.offset = (int(start) - 1) * self.size
        elif self.request.body and self.request.headers.get("Content-Type", "").lower().find("application/json") == 0:
            self.bson = loads(self.request.body)

    def write(self, chunk):
        if isinstance(chunk, dict):
            chunk = dumps(chunk)
            self.set_header("Content-Type", "application/json; charset=UTF-8")
        super(AuthBaseHandler, self).write(chunk)

    def finish_bson(self, success=True, **kwargs):
        self.finish(dict(success=success, **kwargs))


class ActivityHandler(AuthBaseHandler):
    @coroutine
    @authenticated
    def get(self, *args, **kwargs):
        # 1. fuck.... 不知道从哪个版本开始 count 函数删除了，汗，，，
        # estimated_document_count
        total = yield self.db.activity.count_documents({})
        cursor = self.db.activity.find()
        if self.offset:
            cursor.skip(self.offset)
        cursor.limit(self.size)
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


class QrCodePageHandler(AuthBaseHandler):
    @coroutine
    @authenticated
    def get(self, activity_id):
        activity = yield self.db.activity.find_one({'_id': ObjectId(activity_id)})
        if not activity:
            raise HTTPError(401)
        total, offset, size = activity['total'], self.offset, self.size
        cursor = self.db.package.find({ 'activity': activity['_id'] }).sort('_id', pymongo.ASCENDING)
        if offset:
            cursor.skip(offset)
        cursor.limit(size)
        codes = yield cursor.to_list(length=None)
        for c in codes:
            c['img'] = '/activity/%s/qrcode/%s?user=%s' % (activity_id, c['_id'], c['createUser'])
        # if total > size:
        #     pages = range(0, int(math.ceil(total / size)))
        # else:
        #     pages = None
        # self.render('admin/qrcode.html', activity=activity, codes=codes, pages=pages)
        # self.finish({'success': True, 'msg': '获取二维码列表成功', 'urls': urls})
        self.finish_bson(activity=activity, data=codes, total=total)


class QRCodeHander(AuthBaseHandler):
    # @coroutine
    # @authenticated
    def get(self, activity_id, package_id):
        """
        /qrcode 返回数据列表 { urls: [ '', '', '', '' ] }
        /qrcode/activity/seq 返回二维码图片，二维码地址：http://host/qrcode/activity/seq/secret
        """
        user = self.get_query_argument('user')
        salt = crypt.qrcode_md5(dict(_id=package_id, activity=activity_id, createUser=user))
        self.set_header("Content-Type", "image/png")
        img = qrcode.make("http://%s/qrcode/%s/%s" % (config.QrCodeHost, package_id, salt))
        img.save(self, "png")
        self.finish()
