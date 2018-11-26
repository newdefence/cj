# coding=utf-8
__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/11/20 下午9:50:00"

from tornado.web import authenticated, RequestHandler
from tornado.gen import coroutine

from bson.json_util import dumps


class AuthBaseHandler(RequestHandler):
    @property
    def db(self):
        return self.application.settings['db']

    def get_current_user(self):
        return True

    def write(self, chunk):
        if isinstance(chunk, dict):
            chunk = dumps(chunk)
            self.set_header("Content-Type", "application/json; charset=UTF-8")
        super(AuthBaseHandler, self).write(chunk)

class ActivityHandler(AuthBaseHandler):
    @coroutine
    @authenticated
    def get(self, *args, **kwargs):
        activity = yield self.db.activity.find_one()
        self.finish({'data': activity})
        # self.render('wx/hongbao.html')
