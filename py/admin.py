# coding=utf-8
__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/11/20 下午9:50:00"

from datetime import datetime

from tornado.web import authenticated, RequestHandler, HTTPError
from tornado.gen import coroutine

from bson.json_util import dumps, loads

# TODO： 有时间需要做 json_schema 验证

UID = 'uid'

class LoginHandler(RequestHandler):
    def check_xsrf_cookie(self):
        pass

    def get(self):
        if self.application.settings['debug']:
            self.set_secure_cookie(UID, 'TEST_USER')
            self.finish({ 'success': True, 'msg': '登录成功' })
        else:
            raise HTTPError(404)

    def post(self):
        user = loads(self.request.body)
        self.set_secure_cookie(UID, user['name'])
        self.finish({ 'success': True, 'msg': '登录成功' })

    def put(self):
        self.clear_cookie(UID)
        self.finish({ 'success': True, 'msg': '退出成功' })

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
            if start and start.isdigit():
                start = int(start)
                if start > 1:
                    self.offset = (start - 1) * self.size
        elif self.request.body and self.request.headers.get("Content-Type", "").lower().find("application/json") == 0:
            self.bson = loads(self.request.body)

    def write(self, chunk):
        if isinstance(chunk, dict):
            chunk = dumps(chunk)
            self.set_header("Content-Type", "application/json; charset=UTF-8")
        super(AuthBaseHandler, self).write(chunk)

    def finish_bson(self, success = True, **kwargs):
        self.finish(dict(success = success, **kwargs))

class ActivityHandler(AuthBaseHandler):
    @coroutine
    @authenticated
    def get(self, *args, **kwargs):
        # 1. fuck.... 不知道从哪个版本开始 count 函数删除了，汗，，，
        total = yield self.db.activity.count_documents({}) # estimated_document_count
        cursor = self.db.activity.find()
        if self.offset:
            cursor.skip(self.offset)
        cursor.limit(self.size)
        data = yield cursor.to_list(length=None)
        self.finish_bson(total = total, data = data)

    @coroutine
    @authenticated
    def post(self):
        '''设置红包活动信息
        total: 总个数, checked: 已兑金额, checkedCost: 已兑个数
        1. 随机红包: { type: random, count: 总个数, cost: 总价值, config: { range: 随机浮动范围 } }
        2. 固定金额红包: { type: static, count: 总个数, cost: 总价值, config: [{ value: 1, count: 10 }, { value:2, count: 3 }] },
        3. 实物奖励: { type: goods, count, cost, config: [{ value, name, count }, ...]
        '''
        config, user = self.bson, self.current_user
        config.update(createTime = datetime.now(), createUser = user)
        result = yield self.db.activity.insert_one(config)
        self.finish_bson(_id = result.inserted_id, msg = '红包活动创建成功')
