import logging
import re
from logging.handlers import TimedRotatingFileHandler


def filter_(record):
    if record.args:
        aa = record.args[0]
        if aa == 'POST /novel/record/ HTTP/1.1':
            return False
        if aa == 'POST /novel/process/ HTTP/1.1':
            return False
        if aa == 'GET /favicon.ico HTTP/1.1':
            return False
        if aa == 'POST /game/evolution/update/ HTTP/1.1':
            return False
        if '.css' in aa:
            return False
        if '.js' in aa:
            return False
    return True


logger = logging.getLogger('werkzeug')
handler = TimedRotatingFileHandler(filename='log/web.log', when='midnight', backupCount=30, encoding='utf-8')
handler.suffix = '%Y-%m-%d.log'
handler.extMatch = re.compile(r'^\d{4}-\d{2}-\d{2}.log')
handler.addFilter(filter_)
logger.addHandler(handler)
