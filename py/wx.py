# coding=utf-8
__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/11/20 下午9:49:00"

from tornado.web import authenticated, RequestHandler


class AuthBaseHandler(RequestHandler):
    def get_current_user(self):
        return True


class ChouJiangHandler(AuthBaseHandler):
    @authenticated
    def get(self, *args, **kwargs):
        self.render('wx/hongbao.html')


class PostAddressHandler(AuthBaseHandler):
    @authenticated
    def post(self, *args, **kwargs):
        pass
