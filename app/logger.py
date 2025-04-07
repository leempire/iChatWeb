import logging
import os
import re
from logging.handlers import TimedRotatingFileHandler


def filter_(record):
    if record.args:
        aa = record.args[0]
        filt = ['/novel/record/', '/novel/process/', '/favicon.ico', '/game/evolution/update/', '.css', '.js']
        for i in filt:
            if i in aa:
                return False
    return True


if not os.path.exists('log'):
    os.mkdir('log')
logger = logging.getLogger('werkzeug')
handler = TimedRotatingFileHandler(filename='log/web.log', when='midnight', backupCount=30, encoding='utf-8')
handler.suffix = '%Y-%m-%d.log'
handler.extMatch = re.compile(r'^\d{4}-\d{2}-\d{2}.log')
handler.addFilter(filter_)
logger.addHandler(handler)
