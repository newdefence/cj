# coding=utf-8

from datetime import datetime

from tornado.gen import coroutine
from tornado.web import RequestHandler, HTTPError

import bson

import crypt

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/11/20 下午9:49:00"


class AuthBaseHandler(RequestHandler):
    @property
    def db(self):
        return self.application.settings['db']

    def check_xsrf_cookie(self):
        pass


class QrCodeHandler(AuthBaseHandler):
    """扫描二维码地址"""
    @coroutine
    def get(self, package_id, salt):
        try:
            pid = bson.ObjectId(package_id)
        except:
            self.render('wx/bad.html', title='没有该红包')
            return
        package = yield self.db.package.find_one({'_id': pid})
        if (not package) or (salt != crypt.qrcode_md5(package)):
            self.render('wx/bad.html', title='没有该红包')
            return
        if package.get('checkTime'):
            self.render('wx/bad.html', title='该红包已被打开')
            return
        # activity = yield self.db.activity.find_one({'_id': package['activity']})
        now = datetime.now()
        if now > package['endTime']:
            self.render('wx/bad.html', title='该红包已过期')
            return
        elif now < package['startTime']:
            self.render('wx/bad.html', title='该红包活动尚未开始')
            return
        yield self.db.package.update_one({'_id': pid}, {'$set': {'checkTime': now}})
        increment = {'checkCount': 1}
        if isinstance(package['value'], (int, float)):
            increment['checkCost'] = package['value']
        # activity = yield self.db.activity.find_one_and_update({'_id': package['activity']}, {'$inc': increment})
        yield self.db.activity.update_one({'_id': package['activity']}, {'$inc': increment})
        if package['type'] in ('static', 'random'):
            self.render('wx/hongbao.html', package=package)
        else:
            self.render('wx/goods.html', package=package)

class PostAddressHandler(AuthBaseHandler):
    """邮寄地址填写"""
    @coroutine
    def post(self, *args, **kwargs):
        pass
