from .base import *
import threading

salt = Blueprint('salt', __name__)


@salt.route('/salt/getContent/', methods=['POST'])
def getContent():
    order = 'select * from salt order by date desc limit 100;'
    result = sql_manager(order)
    result = [[row[0], row[2]] for row in result]
    return make_resp(result)


@salt.route('/salt/text/', methods=['POST'])
def text():
    data = request.values
    id_ = data.get('id')
    with open('source/salt/{}.txt'.format(id_), encoding='utf-8') as f:
        content = f.read().split('\n')
    return make_resp(content)


class Salt:
    def __init__(self):
        if not os.path.exists('source/salt'):
            os.mkdir('source/salt')
        self.items = []

    def getPage(self, page):
        if type(page) == list:
            for i, p in enumerate(page):
                print('\rsearchingPage: {}/{}'.format(i, len(page)), end='')
                self.getPage(p)
            print('\rsearchingPage done!')
            return
        if page == 1:
            url = 'https://onehu.xyz/archives/'
        else:
            url = 'https://onehu.xyz/archives/page/{}/#board'.format(page)
        bug = Bug(url)
        group = bug.find('class="list-group"')
        for a in group.findall('<a'):
            date = a.find('<time').get_text()
            url = 'https://onehu.xyz' + a['href']
            title = a.find('<div').get_text(['知乎'])
            self.items.append(['{}-'.format(time.localtime()[0]) + date, title, url])

    def getText(self, url):
        bug = Bug(url)
        board = bug.find('id="board"').find('class="markdown-body"')
        text = board.get_text(['关注不迷路~', '知乎'])
        while '\n\n' in text:
            text = text.replace('\n\n', '\n')
        return text.strip()

    def getId(self):
        order = 'select max(id)+1 from salt;'
        id_ = sql_manager(order)[0][0]
        return id_ or 1

    def checkExist(self, title):
        order = 'select * from salt where title="{}";'.format(title)
        result = sql_manager(order)
        if result:
            return True
        return False

    def save(self, item):
        date, title, url = item
        if self.checkExist(title):  # 结果已存在
            print('\r{}已存在'.format(title))
            return
        id_ = self.getId()
        text = self.getText(url)
        with open('source/salt/{}.txt'.format(id_), 'w', encoding='utf-8') as f:
            f.write(text)
        order = 'insert into salt values({}, "{}", "{}");'.format(id_, date, title[:40])
        sql_manager(order)

    def run(self):
        while True:
            self.getPage(1)
            for i, item in enumerate(self.items):
                print('\rsavingItem: {}/{}'.format(i, len(self.items)), end='')
                self.save(item)
            print('\rsavingItem done!')
            time.sleep(24 * 60 * 60)


# threading.Thread(target=Salt().run, daemon=True).start()
