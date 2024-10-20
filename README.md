# iChatWeb

环境配置：python 3.10
```commandline
pip install -r requirements.txt
```

数据库准备
1. 安装 [mysql server](https://dev.mysql.com/downloads/mysql/)
2. 创建本地数据库账号
3. 执行`./create.sql`的命令，可在登录 mysql 后使用`source 文件路径`命令
4. 在`./app/base.py`第 165 行相应的修改数据库参数（IP、端口号、用户名、密码）

邮箱准备
1. 登录[QQ邮箱](https://mail.qq.com/)
2. 点击右上角“账号与安全”
3. 点击左边“安全设置”
4. 开启“POP3/IMAP/SMTP/Exchange/CardDAV 服务”，并获取授权码
5. 在`./app/base.py`第 30 行修改默认值`user=邮箱地址, code=授权码`

设置网站的ip和端口号
1. 在`./manage.py`第 69 行修改`host, port`参数

启动网站服务器
```commandline
python manage.py
```
