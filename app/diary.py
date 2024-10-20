from .base import *

diary = Blueprint('diary', __name__)


def get_cate_by_account_id(account_id):
    order = 'select id, name ' \
            'from cate_of_account ' \
            'right join diary_cate on id = cate_id ' \
            'where account_id = {};'.format(account_id)
    return dict(sql_manager(order))


def get_cate_by_diary_id(diary_id):
    order = 'select id, name ' \
            'from cate_of_diary ' \
            'left join diary_cate on id = cate_id ' \
            'where diary_id = {};'.format(diary_id)
    return dict(sql_manager(order))


def check_allow(account_id, diary_id):
    order = 'select account_id from diary_item where id = {} and account_id = {};'.format(diary_id, account_id)
    if sql_manager(order):
        return True
    permit_cate = get_cate_by_account_id(account_id)
    if not permit_cate:
        return False
    order = 'select * from cate_of_diary where diary_id = {} and cate_id in ({});'.format(
        diary_id, ','.join(str(i) for i in permit_cate))
    if sql_manager(order):
        return True
    return False


@diary.route('/diary/fetch/', methods=['POST'])
def fetch():
    # post: code
    # return: {'cate': , 'diary': }
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code)

    order = 'select id from diary_item where account_id = {};'.format(id_)
    diary_ids = [item[0] for item in sql_manager(order)]
    cate = get_cate_by_account_id(id_)
    result = {'cate': cate, 'diary': {}}
    if cate:
        order = 'select diary_id from cate_of_diary where cate_id in ({});'.format(
            ','.join(str(i) for i in cate.keys()))
        diary_ids += [item[0] for item in sql_manager(order)]
        diary_ids = list(set(diary_ids))
    if not diary_ids:
        return make_resp(result)
    order = 'select * from diary_item where id in ({}) order by time desc;'.format(','.join(str(i) for i in diary_ids))
    diaries = []
    for d in sql_manager(order):
        a = [str(i) for i in d[1:-1]] + [get_cate_by_diary_id(d[0])]
        diaries.append([d[0], a])
    result['diary'] = diaries
    return make_resp(result)


@diary.route('/diary/addCate/', methods=['POST'])
def add_cate():
    # post: code, name
    # return: success, null error
    data = request.values
    code, name = data.get('code'), data.get('name')
    if name == '':
        return make_resp('null error')
    id_ = get_id_by_code(code)

    cate_id = get_next_id('diary_cate')
    order = 'insert into diary_cate values({}, "{}");'.format(cate_id, name)
    sql_manager(order)
    order = 'insert into cate_of_account values({}, {})'.format(id_, cate_id)
    sql_manager(order)
    return make_resp('success')


@diary.route('/diary/delCate/', methods=['POST'])
def del_cate():
    # post: code, id
    # return: success
    data = request.values
    code, cate_ids = data.get('code'), data.getlist('cate')
    id_ = get_id_by_code(code)

    for cate_id in cate_ids:
        order = 'delete from cate_of_account where account_id = {} and cate_id = {};'.format(id_, cate_id)
        sql_manager(order)
        order = 'select * from cate_of_account where cate_id = {};'.format(cate_id)
        if not sql_manager(order):
            order = 'delete from diary_cate where id = {};'.format(cate_id)
            sql_manager(order)
            order = 'delete from cate_of_diary where cate_id = {};'.format(cate_id)
            sql_manager(order)
    return make_resp('success')


@diary.route('/diary/shareCate/', methods=['POST'])
def share_cate():
    # post: code, account, cate
    # return: success, account not exist, not allowed, existed
    data = request.values
    code, account, cate_ids = data.get('code'), data.get('account'), data.getlist('cate')
    id_ = get_id_by_code(code)
    permit_cate = get_cate_by_account_id(id_)
    for cate_id in cate_ids:
        if int(cate_id) not in permit_cate:
            return make_resp('not allowed')

        order = 'select id from accounts where account = "{}" or email = "{}";'.format(account, account)
        result = sql_manager(order)
        if not result:
            return make_resp('account not exist')
        account_id = result[0][0]
        order = 'select * from cate_of_account where account_id = {} and cate_id = {};'.format(account_id, cate_id)
        if sql_manager(order):
            return 'existed'
        order = 'insert into cate_of_account values({}, {});'.format(account_id, cate_id)
        sql_manager(order)
    return make_resp('success')


@diary.route('/diary/addDiary/', methods=['POST'])
def add_diary():
    # post: code, title, time, content, cate([1,2])
    # return: not allowed, success, null error
    data = request.values
    code = data.get('code')
    title, time, content, cate = data.get('title'), data.get('time'), data.get('content'), data.getlist('cate')
    if '' in [title, time]:
        return make_resp('null error')
    id_ = get_id_by_code(code)

    num = get_next_id('diary_item')

    cates = get_cate_by_account_id(id_)
    for c in cate:
        if int(c) not in cates:
            return make_resp('not allowed')
    order = 'insert into diary_item values({}, "{}", "{}", "{}", {});'.format(num, time, title, content, id_)
    sql_manager(order)
    for c in cate:
        order = 'insert into cate_of_diary values({}, {});'.format(num, c)
        sql_manager(order)
    return make_resp('success')


@diary.route('/diary/alterDiary/', methods=['POST'])
def alter_diary():
    # post: code, id, title, time, content, cate([1,2])
    # return: null error, success, not allowed
    data = request.values
    code = data.get('code')
    diary_id = data.get('id')
    title, time, content, cate = data.get('title'), data.get('time'), data.get('content'), data.getlist('cate')
    if '' in [title, time]:
        return make_resp('null error')
    id_ = get_id_by_code(code)
    if not check_allow(id_, diary_id):
        return 'not allowed'

    order = 'update diary_item set title="{}", time="{}", content="{}" where id = {};'.format(
        title, time, content, diary_id)
    sql_manager(order)

    permit_cate = get_cate_by_account_id(id_)
    order = 'delete from cate_of_diary where diary_id = {} and cate_id in ({});'.format(
        diary_id, ','.join(str(i) for i in permit_cate))
    sql_manager(order)
    for c in cate:
        order = 'insert into cate_of_diary values({}, {});'.format(diary_id, c)
        sql_manager(order)
    return make_resp('success')


@diary.route('/diary/delDiary/', methods=['POST'])
def del_diary():
    # post: code, id
    # return: success, not allowed
    data = request.values
    code = data.get('code')
    diary_id = data.get('id')
    id_ = get_id_by_code(code)

    if not check_allow(id_, diary_id):
        return 'not allowed'

    order = 'delete from diary_item where id = {};'.format(diary_id)
    sql_manager(order)
    permit_cate = get_cate_by_account_id(id_)
    if permit_cate:
        order = 'delete from cate_of_diary where diary_id = {} and cate_id in ({});'.format(
            diary_id, ','.join(str(i) for i in permit_cate))
        sql_manager(order)
    return make_resp('success')
