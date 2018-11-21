# coding=utf-8
__author__ = 'defence.zhang@gamil.com'
__date__ = "2018/11/20 下午9:38:00"

import sys
reload(sys)
sys.setdefaultencoding("utf8")

import os
from datetime import datetime

from tornado.ioloop import IOLoop
from tornado.log import app_log
from tornado.options import define, options, parse_command_line
from tornado.web import Application, RequestHandler

define("port", default=8050, type=int, help="server listen port")
define("debug", default=True, type=bool, help="server run mode")
parse_command_line()

from www import wx


class IndexHandler(RequestHandler):
    def get(self):
        self.finish('Welcome !!!')


def main():
    settings = dict(
        template_path=os.path.join(os.path.dirname(__file__), 'templates'),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        xsrf_cookies=True,
        cookie_secret=datetime.today().strftime("CJ%Y"),
        debug=options.debug,
        autoescape=None
    )
    handlers = [
        (r'/', IndexHandler),
        (r'/wx/cj.html', wx.ChouJiangHandler),
        (r'/wx/post.json', wx.PostAddressHandler)

    ]

    application = Application(handlers, **settings)
    application.listen(options.port, xheaders=True)
    app_log.warning("waqu live start at port: %s" % options.port)
    IOLoop.instance().start()


if __name__ == '__main__':
    main()
