# cj
瞎折腾

1. install [Python](https://www.python.org/downloads/), [pip](https://pip.pypa.io/en/stable/installing/), [MongoDB](https://www.mongodb.com/download-center/community).
2. install library: [tornado](http://www.tornadoweb.org/en/stable/index.html), [motor](https://motor.readthedocs.io/en/stable/index.html), [qrcode](https://pypi.org/project/qrcode/)

```sh
pip install tornado
pip install motor
pip install qrcode[pil]
```

3. [mongodb-express](https://www.npmjs.com/package/mongo-express)
4. 文档：https://docs.mongodb.com/
5. 线上 mongo：https://www.mongodb.com/cloud/atlas/pricing

## MongoDB Server
```sh
mkdir -p /data/db
# ensure that the user account running mongod has read and write permissions for the directory
mongod
<path to binary>/mongod
mongod --dbpath <path to data directory>
```

## MongoDB Client
```sh
cd <mongodb installation dir>/bin
mongo
mongo --port 28015
mongo --host mongodb0.example.com --port 28015
mongo --username alice --password --authenticationDatabase admin --host mongodb0.examples.com --port 28015
mongo mongodb://mongodb0.example.com:28015
mongo "mongodb://cluster0-shard-00-00-host:27017,cluster0-shard-00-01-host:27017,cluster0-shard-00-02-host:27017/test?replicaSet=Cluster0-shard-0" --ssl --authenticationDatabase admin --username name --password <PASSWORD>
```

# mongo-express
```sh
npm install -g mongo-express
# or
npm install mongo-express
# Copy YOUR_PATH/node_modules/mongo-express/config.default.js into a new file 
# called YOUR_PATH/node_modules/mongo-express/config.js.
cd YOUR_PATH/node_modules/mongo-express/ && node app.js
mongo-express -u user -p password -d database
mongo-express -u user -p password -d database -H mongoDBHost -P mongoDBPort
# use it as an administrator
mongo-express -a -u superuser -p password
# For help on configuration options:
mongo-express -h
```

# 项目启动步骤：
```bash
# 1. 进入项目目录，启动数据库代理
# 2. 启动 python 项目后台，启动**默认**端口
python app.py
# 3. 进入 web 项目
cd static
# 4.1 进入开发模式，直接打开 http://localhost:8080 即可访问
yarn dev
# 4.2 进入发版模式，构建完毕后需要 scp 的目录有 static/lib, static/dist
yarn build
```
# nginx 配置
在 sever 节点下添加 location 即可
```conf
location =/ {
    rewrite / /static/dist/index.html;
}
# NOTE: ^~ 前缀匹配规则优先级高于 ~ 正则匹配优先级
location ^~ /static/ {
    root /opt/admin;
}

location ~ \.html$ {
    try_files $uri /index.html;
    root /opt/admin/static/dist; # eg. root /path1/; /a.html ==> /path1/a.html --> /path1/static/index.html
}
```
