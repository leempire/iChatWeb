from flask import Flask, Blueprint, request, make_response, redirect
import pymysql
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
        self.host, self.port, self.user, self.password, self.database = host, port, user, str(password), database

        self.connections = [None for _ in range(connection_num)]
        self.locks = [threading.Lock() for _ in range(connection_num)]
        self.lock0 = threading.Lock()
        self.head = 0

    def connect(self):
        connection = pymysql.connect(host=self.host, 
                              port=self.port, 
                              user=self.user,
                              password=self.password, 
                              database=self.database)
        return connection

    def __call__(self, order):
        """执行order"""
        target = order.split(' ')[0].lower()
        if target in ['select']:
            commit = False
        elif target in ['update', 'delete', 'insert']:
            commit = True
        else:
            print(order)
            raise NotImplementedError

        self.lock0.acquire()
        for _ in range(3):
            if self.locks[self.head].locked():
                self.head += 1
                if self.head == len(self.locks):
                    self.head = 0
        pin = self.head
        self.lock0.release()
        
        self.locks[pin].acquire()
        # 检查连接是否正常
        if not self.connections[pin] or not self.connections[pin].open:
            self.connections[pin] = self.connect()
        # 执行操作
        print(order)
        try:
            with self.connections[pin].cursor() as cursor:
                cursor.execute(order)
                records = cursor.fetchall()
        except Exception:
            self.connections[pin] = self.connect()
            with self.connections[pin].cursor() as cursor:
                cursor.execute(order)
                records = cursor.fetchall()
        print(records)
        if commit:
            self.connections[pin].commit()
        self.locks[pin].release()
        return records


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
