# iChatWeb

## 环境配置：
python 3.10
```commandline
pip install -r requirements.txt
```

数据库准备
1. 安装 [mysql server](https://dev.mysql.com/downloads/mysql/)
2. 创建本地数据库账号
3. 在此目录下，在终端运行`mysql -u 用户名 -p`登录mysql，然后执行`source ./create.sql`命令
4. 在`./config.yaml.template`中修改数据库`sql`相关参数

邮箱准备
1. 登录[QQ邮箱](https://mail.qq.com/)
2. 点击右上角“账号与安全”
3. 点击左边“安全设置”
4. 开启“POP3/IMAP/SMTP/Exchange/CardDAV 服务”，并获取授权码
5. 在`./config.yaml.template`中修改邮箱参数`user: 邮箱地址, code: 授权码`

设置网站的ip和端口号
1. 在`./config.yaml.template`中修改`flask`项的`host, port`参数

将`./config.yaml.template`文件改名为`./config.yaml`

启动网站服务器
```commandline
python manage.py
```

## Q&A
> Q: 怎么往书城中添加小说

A: 将小说的txt文件放入`./source/novel/`文件夹中，然后运行`python add_novel.py`即可。下载小说可使用[novelManager](https://github.com/leempire/novelmanager)程序。

> Q: 响应太慢了怎么办？

A: 如果是mysql相应慢，可以修改`config.yaml`文件中的`sql.connection_num`参数，当用户较少的时候，将该参数设置为1；当用户较多时，将该参数设置更大的值。
