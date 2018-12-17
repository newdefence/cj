# coding=utf-8

from tornado.web import authenticated, RequestHandler, HTTPError
from tornado.gen import coroutine

from bson.json_util import dumps, loads

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/12/17 下午5:54:00"

# TODO： 有时间需要做 json_schema 验证


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
