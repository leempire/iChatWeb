import shutil
import threading
from .base import *

novel = Blueprint('novel', __name__)


@novel.route('/novel/shelf/', methods=['POST'])
def shelf():
    # post: code
    # return: shelf
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code, announce='shelf')
    if id_ is None:
        return make_resp('error')
    order = 'select book_id, name, total_time from shelf left join books on books.id = shelf.book_id\
     where account_id = {} order by last_read desc;'.format(id_)
    result = sql_manager(order)
    return make_resp(json.dumps(result))


@novel.route('/novel/process/', methods=['POST'])
def process():
    # post: code, id
    # return: chapter
    data = request.values
    code = data.get('code')
    book_id = data.get('id')
    id_ = get_id_by_code(code, announce='novelProcess')
    if id_ is None:
        return make_resp('error')
    order = 'select process from shelf where account_id = {} and book_id = {};'.format(id_, book_id)
    result = sql_manager(order)
    if not result:
        chapter = 0
    else:
        chapter = result[0][0]
    return make_resp(str(chapter))


@novel.route('/novel/text/', methods=['POST'])
def text():
    # post: id, code, chapter
    # return: text
    data = request.values
    book_id = data.get('id')
    chapter = data.get('chapter')
    chapter = int(chapter)
    order = 'select location from books where id = {};'.format(book_id)
    location = sql_manager(order)[0][0]
    with open(location, encoding='utf-8') as f:
        data = f.read().split('\n\n')
        if chapter >= len(data):
            return make_resp(json.dumps({'title': 'exceed', 'text': len(data) - 1}))
        data = data[chapter].split('\n')
        title = data[0]
        text = data[1:]
    data = json.dumps({'title': title, 'text': text})
    return make_resp(data)


@novel.route('/novel/content/', methods=['POST'])
def content():
    # post: id
    # return: content
    data = request.values
    book_id = data.get('id')
    if not book_id:
        return make_resp({'name': '小说', 'content': []})
    order = 'select name, location from books where id = {};'.format(book_id)
    name, location = sql_manager(order)[0]
    with open(location, encoding='utf-8') as f:
        data = f.read().split('\n\n')
        con = []
        for chapter in data:
            con.append(chapter.split('\n')[0])
    con = json.dumps({'name': name, 'content': con})
    return make_resp(con)


@novel.route('/novel/record/', methods=['POST'])
def record():
    # post: code, id, chapter
    # return: success
    data = request.values
    code, book_id, chapter = data.get('code'), data.get('id'), data.get('chapter')
    id_ = get_id_by_code(code, announce=False)
    if id_ is None:
        return make_resp('error')

    order = 'select last_read from shelf where account_id = {} and book_id = {};'.format(id_, book_id)
    result = sql_manager(order)
    if not result:
        order = 'insert into shelf(account_id, book_id) values({}, {})'.format(id_, book_id)
        sql_manager(order)
        last_read = None
    else:
        last_read = result[0][0]
    if not last_read:
        last_read = time.time()
    else:
        last_read = time.mktime(last_read.timetuple())
    delta = time.time() - last_read
    if delta < 60:
        order = 'update shelf ' \
                'set total_time = total_time + {}, ' \
                'process = {} ' \
                'where account_id = {} and book_id = {};'.format(delta, chapter, id_, book_id)
    else:
        order = 'update shelf ' \
                'set process = {} ' \
                'where account_id = {} and book_id = {};'.format(chapter, id_, book_id)
    sql_manager(order)

    order = 'select max(time) from read_record where account_id = {} and book_id = {};'.format(id_, book_id)
    last_read = sql_manager(order)[0][0]
    if not last_read:
        last_read = 0
    else:
        last_read = time.mktime(last_read.timetuple())
    delta = time.time() - last_read
    if delta > 10:
        order = 'insert into read_record(account_id, book_id, process) ' \
                'values({}, {}, {});'.format(id_, book_id, chapter)
        sql_manager(order)
    return make_resp('success')


@novel.route('/novel/city/', methods=['POST'])
def city():
    order = 'select id, name from books;'
    result = sql_manager(order)
    result = json.dumps(result)
    return make_resp(result)


@novel.route('/novel/add/', methods=['POST'])
def add():
    # post: code, id
    # return: success
    data = request.values
    code, book_id = data.get('code'), data.get('id')
    id_ = get_id_by_code(code, announce='novelAdd')
    if id_ is None:
        return make_resp('error')

    order = 'select * from shelf where account_id = {} and book_id = {};'.format(id_, book_id)
    if sql_manager(order):
        return make_resp('success')
    else:
        order = 'insert into shelf(account_id, book_id) values({}, {})'.format(id_, book_id)
        sql_manager(order)
        return make_resp('success')


@novel.route('/novel/download/', methods=['POST'])
def download():
    # post: code, id
    # return: success
    data = request.values
    code, book_id = data.get('code'), data.get('id')
    id_ = get_id_by_code(code, announce='novelDownload')
    # 获取书名及地址
    order = 'select name, location from books where id = {};'.format(book_id)
    name, location = sql_manager(order)[0]
    with open(location, encoding='utf-8') as f:
        data = [chap.split('\n') for chap in f.read().split('\n\n')]
    with open('source/novel/offline.html', encoding='utf-8') as f:
        tmp = f.read()
    chapter = int(sql_manager('select process from shelf where account_id = {} and book_id = {}'
                              .format(id_, book_id))[0][0])
    tmp = tmp.replace('//**novel**//', str(data))
    tmp = tmp.replace('//**chapter**//', str(chapter))
    tmp = tmp.replace('//**name**//', name)
    save_path = cloud_manager.store('{}.html'.format(name), id_)
    with open(save_path, 'w', encoding='utf-8') as f:
        f.write(tmp)
    return make_resp('success')


@novel.route('/novel/stat/', methods=['POST'])
def stat():
    # post: code, id
    # return: {k1: v1, ...}
    data = request.values
    code, book_id = data.get('code'), data.get('id')
    id_ = get_id_by_code(code, announce='novelStat')
    try:
        result = Stat(id_, book_id).result
    except Exception:
        result = 'error'
    return make_resp(result)


class Stat:
    def __init__(self, id_, book_id):
        self.id_, self.book_id = id_, book_id
        self.chapters = []
        self.read_record = []
        self.p_read_record = {}
        self.dt2s = lambda x: x.strftime('%Y-%m-%d %H:%M:%S')
        self.dt2d = lambda x: x.strftime('%Y-%m-%d')
        self.num2str = lambda x: str(x) if x < 10000 else '{}万'.format(x / 10000)
        self.today = time.strftime('%Y-%m-%d', time.localtime(time.time()))
        self.sql_get()

    @staticmethod
    def t2str(t):
        if t < 60:
            t = '{:.0f}s'.format(t)
        elif t < 3600:
            t = '{:.0f}min {:.0f}s'.format(t // 60, t % 60)
        else:
            t = '{:.0f}h {:.0f}min'.format(t // 3600, (t / 60) % 60)
        return t

    @staticmethod
    def check_dp_dt(dp, dt):
        if dt > 60:  # 超过一分钟没有阅读，视为离开
            return False
        if abs(dp) > 6000:  # 阅读速度超过100字/s，视为跳转章节
            return False
        if abs(dp) < 10:  # 阅读速度不足1字/s，视为没有阅读
            return False
        return True

    @property
    def result(self):
        if not self.check_enough():
            result = {'阅读时间不足': '无法统计'}
        else:
            result = self.stat()
        return result

    def check_enough(self):
        if len(self.read_record) < 2:
            return False
        self.analyse_read_record()
        if not self.p_read_record:
            return False
        return True

    def sql_get(self):
        order = 'select location from books where id = {};'.format(self.book_id)
        location = sql_manager(order)[0][0]
        with open(location, encoding='utf-8') as f:
            book = f.read()
        self.chapters = [len(chapter) for chapter in book.split('\n\n')]

        order = 'select process, time from read_record where account_id = {} and book_id = {} ' \
                'order by time;'.format(self.id_, self.book_id)
        self.read_record = sql_manager(order)

    def stat(self):
        result = dict()
        # 总字数
        total_words = sum(self.chapters)
        result['总字数'] = self.num2str(total_words)
        # 已读章节
        now_chapter = int(self.read_record[-1][0]) + 1
        result['已读章节'] = '{} / {}'.format(now_chapter, len(self.chapters))
        # 阅读进度
        now = self.p2num(self.read_record[-1][0])
        result['阅读进度'] = '{:.2%}'.format(now / total_words)

        # 上次阅读
        result['上次阅读'] = self.dt2s(self.read_record[-1][1])
        # 阅读天数
        days = len(self.p_read_record)
        result['阅读天数'] = '{}天'.format(days)
        # 阅读时长
        total_t = sum(item[1] for item in self.p_read_record.values())
        result['阅读时长'] = self.t2str(total_t)
        # 平均每天阅读时长
        if self.today in self.p_read_record:
            if days > 1:
                t_per_day = (total_t - self.p_read_record[self.today][1]) / (days - 1)
            else:
                t_per_day = total_t
        else:
            t_per_day = total_t / days
        result['平均每天阅读时长'] = self.t2str(t_per_day)
        # 阅读速度
        total_p = sum(item[0] for item in self.p_read_record.values())
        v = total_p / total_t
        result['阅读速度'] = '{:.2f}字/s'.format(v)
        # 剩余阅读时间
        t_left = float(total_words - now) / v
        t_left_str = self.t2str(t_left) + '（{:.1f}天）'.format(t_left / total_t * days)
        result['预计剩余阅读时间'] = t_left_str
        return result

    def p2num(self, p):
        a = int(p)
        if a >= len(self.chapters):
            a = len(self.chapters) - 1
        b = p - a
        aa = sum(self.chapters[:a])
        bb = self.chapters[a] * b
        return aa + bb

    def analyse_read_record(self):
        record_ = {}
        p0 = self.p2num(self.read_record[0][0])
        t0 = time.mktime(self.read_record[0][1].timetuple())
        for i in range(1, len(self.read_record)):
            p1 = self.p2num(self.read_record[i][0])
            t1 = time.mktime(self.read_record[i][1].timetuple())
            dp = float(p1 - p0)
            dt = t1 - t0
            if self.check_dp_dt(dp, dt):
                date = self.read_record[i][1].strftime('%Y-%m-%d')
                if date not in record_:
                    record_[date] = [dp, dt]
                else:
                    record_[date][0] += dp
                    record_[date][1] += dt
            p0, t0 = p1, t1
        self.p_read_record = record_
