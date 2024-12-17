from flask import Flask, Blueprint, request, make_response, redirect
import pymysql
from dbutils.pooled_db import PooledDB
import random
import json
import os
import re
import time
import shutil
import requests
import urllib
import smtplib
import yaml
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from .bug import Bug
import sys

sys.stdout.reconfigure(line_buffering=True)

with open('./config.yaml', encoding='utf-8') as f:
    config = yaml.safe_load(f)


def get_code():
    while True:
        code = str(random.random())[2:12]
        order = 'select id from accounts where code = "{}";'.format(code)
        if not sql_manager(order):
            break
    return code


class EmailSender:
    """南灵邮递员"""

    def __init__(self, user=config['email']['user'], code=config['email']['code'], server=config['email']['server']):
        """初始化"""
        # 用户和密码
        self.user = user
        self.code = code
        # 初始化
        self.title, self.text, self.file = None, None, None
        self.smtp = smtplib.SMTP_SSL(*server)
        self.smtp.login(self.user, self.code)

    def set_message(self, title=None, text=None, file=None):
        """设置信息"""
        self.title = title or self.title
        self.text = text or self.text
        self.file = file or self.file

    def send_message(self, receiver, quit_=True):
        """发送邮件"""
        # 加载头部信息
        message = self._set_head(receiver)
        # 添加附件
        self._attach_file(message)
        # 载入正文
        self._set_text(message)
        # 发送
        self.smtp.sendmail(self.user, receiver, str(message))
        # 退出
        if quit_:
            self.quit()

    def _set_head(self, receiver):
        message = MIMEMultipart()
        message['subject'] = self.title  # 标题
        message['from'] = self.user  # 发送者
        message['to'] = receiver
        return message

    def _attach_file(self, message):
        if self.file:
            part = MIMEApplication(open(self.file, 'rb').read())
            part.add_header('Content-Disposition', 'attachment', filename=self.file)
            message.attach(part)

    def _set_text(self, message):
        text = MIMEText(self.text)
        message.attach(text)

    def quit(self):
        """退出"""
        self.smtp.quit()


def make_resp(content):
    if type(content) in (list, dict):
        content = json.dumps(content)
        content = content.encode()
    elif type(content) == str:
        content = content.encode()
    resp = make_response(content)
    resp.status = '200'
    resp.headers['Access-Control-Allow-Origin'] = "*"  # 设置允许跨域
    resp.headers['Access-Control-Allow-Methods'] = 'PUT,GET,POST,DELETE'
    return resp


class SQL:
    def __init__(self, host=config['sql']['host'], port=config['sql']['port'], user=config['sql']['user'], password=config['sql']['password'], database=config['sql']['database'], connection_num=config['sql']['connection_num']):
        
        self.pool = PooledDB(creator=pymysql, 
                             mincached=1,  # 启动时连接数
                             maxcached=connection_num,  # 最大同时连接数
                             maxconnections=connection_num,  # 同上
                             
                             blocking=True,
                             ping=1,
                             host=host, 
                             port=port,
                             user=user, 
                             password=password, 
                             db=database,
                             cursorclass=pymysql.cursors.Cursor,
                             setsession=['SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED']
)
        

    def __call__(self, order):
        """执行order"""
        # 获取连接
        conn = self.pool.connection()
        cursor = conn.cursor()
        # 执行操作
        cursor.execute(order)
        result = cursor.fetchall()
        conn.commit()
        # 关闭连接
        cursor.close()
        conn.close()
        return result


def get_id_by_code(code, announce=True):
    if code in code_id:
        id_ = code_id[code]
    else:
        order = 'select id from accounts where code = "{}";'.format(code)
        result = sql_manager(order)
        if result:
            id_ = result[0][0]
            code_id[code] = id_
        else:
            return None
    if announce:
        txt = time.strftime('[%Y-%m-%d %H:%M:%S]', time.localtime()) + ' ' + str(id_)
        if type(announce) == str:
            txt += ' ' + announce
        print(txt)
    return id_


def get_next_id(sheet, col='id'):
    order = 'select max({}) from {};'.format(col, sheet)
    num = (sql_manager(order)[0][0] or 0) + 1
    return num


class Cloud:
    _root = 'static/cloud/data/'

    def store(self, filename, id_=None, code=None):
        id_ = id_ or get_id_by_code(code)
        have = os.listdir(self._root)
        have = [os.path.basename(i) for i in have]
        while True:
            name = str(random.random())[2:12] + str(random.random())[2:12]
            if name not in have:
                break

        name = name + os.path.splitext(filename)[1]
        order = 'insert into cloud(account_id, filename, location) values({}, "{}", "{}");'.format(id_, filename, name)
        sql_manager(order)
        return self._root + name

    def delete(self, location):
        order = 'delete from cloud where location = "{}";'.format(location)
        sql_manager(order)
        os.remove(self._root+location)


cloud_manager = Cloud()
sql_manager = SQL()
code_id = {}
