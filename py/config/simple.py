# coding=utf-8
import urllib

__author__ = 'defence.zhang@gmail.com'
__date__ = "2018/12/14 下午05:50"

# 数据库连接地址
# mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
mongodb = "mongodb://%(username)s:%(password)s@%(hosts)s/%(database)s?%(options)s" % {
    "username": 'USER_NAME',
    "password": 'PASSWORD',
    "hosts": 'HOST[:PORT]',
    'database': 'DEFAULT_DATABASE',
    'options': urllib.urlencode({
        'ssl': 'true', # lower(str(True)).
        'replicaSet': 'Cluster0-shard-0',
        'authSource': 'admin',
        'retryWrites': 'true',
    }),
}

# 二维码域名
QrCodeHost = '127.0.0.1:8999'
