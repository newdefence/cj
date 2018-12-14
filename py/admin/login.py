# coding=utf-8

from tornado.web import RequestHandler, HTTPError
from tornado.gen import coroutine

from bson import ObjectId
from bson.json_util import dumps, loads

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/12/14 下午9:58"

UID_KEY = 'uid'

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
