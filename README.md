# iChatWeb

## 环境配置：
### python 虚拟环境及相关依赖
准备 python 3.10 ，在 iChatWeb 目录下执行以下命令，创建虚拟环境并安装依赖。
```bash
# 创建虚拟环境
python -m venv ichat
# 激活虚拟环境，windows运行ichat\Scripts\activate.bat
source ichat/bin/activate
pip install -r requirements.txt
```

### 安装并配置 mysql 数据库
1. 安装 [mysql server](https://dev.mysql.com/downloads/mysql/)并创建数据库账号。使用linux系统安装可以参考 Q&A 中提到方法。
2. 在 iChatWeb 目录下，在终端运行`mysql -u root -p`登录mysql，然后执行`source create.sql;`命令。
3. 在`./config.yaml.template`中修改数据库`sql`相关参数。

### 配置邮箱
配置邮箱信息以便给网站用户发送消息（注册、找回密码等操作）
1. 登录[QQ邮箱](https://mail.qq.com/)。
2. 点击右上角“账号与安全”。
3. 点击左边“安全设置”。
4. 开启“POP3/IMAP/SMTP/Exchange/CardDAV 服务”，并获取授权码。
5. 在`./config.yaml.template`中修改邮箱参数`user: 邮箱地址, code: 授权码`。

### 设置网站的ip和端口号
1. 在`./config.yaml.template`中修改`flask`项的`host, port`参数。

将`./config.yaml.template`文件改名为`./config.yaml`。

## 启动网站
启动网站服务器
```bash
python manage.py
```

在后端运行服务器
```bash
nohup python manage.py > ichat.log 2>&1 &
```

启动服务器后，在浏览器中访问`ip:端口号`即可。

## Q&A
> Q: 怎么往书城中添加小说

将小说的txt文件放入`./source/novel/`文件夹中，然后运行`python add_novel.py`即可。使用[novelManager](https://github.com/leempire/novelmanager)程序可以快速下载小说，通过设置导出路径可以与 iChatWeb 很方便的进行联动。

> Q: 响应太慢了怎么办？

如果是mysql相应慢，可以修改`config.yaml`文件中的`sql.connection_num`参数，当用户较少的时候，将该参数设置为1；当用户较多时，将该参数设置更大的值。

> Q: Linux系统下怎么安装 mysql server ？

执行以下命令即可。

```bash
sudo yum mysql-server
sudo systemctl start mysqld
sudo mysql_secure_installation
```

> Q: 怎么在后台快速注册用户？

执行命令`python tools/add_user.py <account> <password> <email=null>`，注意 account 和 email 必须是唯一的。在 mysql 中执行`select * from accounts;`可查看所有注册的账户。

> Q: 怎么备份和复原数据库？

备份数据库
```bash
mysqldump ichat -u root -p > ichat_backup.sql;
```

复原数据库
```bash
mysql -u root -p
# 以下是mysql命令
> use ichat;
> source ichat_backup.sql;
```
