# coding=utf-8

from tornado.options import options

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/12/14 下午05:38"

if options.debug:
    from local import *
else:
    from online import *
