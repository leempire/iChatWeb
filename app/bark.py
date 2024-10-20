from .base import *

bark = Blueprint('bark', __name__)


@bark.route('/bark/add/', methods=['POST'])
def add():
    # post: code, url, name
    # return: success
    data = request.values
    code = data.get('code')
    url, name = data.get('url'), data.get('name')

    if url[:4] != 'http':
        if url[:2] != '//':
            if url[0] != '/':
                url = 'https://' + url
            else:
                url = 'https:/' + url
        else:
            url = 'https:' + url
    result = urllib.parse.urlparse(url)
    favicon_url = '//{}/favicon.ico'.format(result.netloc)
    next_id = get_next_id('bark')

    id_ = get_id_by_code(code)
    order = 'insert into bark values({}, {}, "{}", "{}", "{}")'.format(next_id, id_, url, favicon_url, name)
    sql_manager(order)
    return make_resp('success')


@bark.route('/bark/get/', methods=['POST'])
def get():
    # post: code
    # return: [[url, favicon_url, name, id], ...]
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code)
    order = 'select url, favicon_url, name, id from bark where account_id = {} order by id'.format(id_)
    result = sql_manager(order)
    return make_resp(list(result))


@bark.route('/bark/delete/', methods=['POST'])
def delete():
    # post: code, id
    # return: success
    data = request.values
    code, bark_id = data.get('code'), data.get('id')
    id_ = get_id_by_code(code)
    order = 'delete from bark where id = {} and account_id = {}'.format(bark_id, id_)
    sql_manager(order)
    return make_resp('success')


@bark.route('/bark/up/', methods=['POST'])
def up():
    # post: code, id
    # return: success
    data = request.values
    code, id1 = data.get('code'), data.get('id')

    id_ = get_id_by_code(code)
    order = 'select max(id) from bark where id < {} and account_id = {}'.format(id1, id_)
    id2 = sql_manager(order)[0][0]
    if not id2:
        return make_resp('success')
    order = 'update bark set id = 0 where id = {} and account_id = {}'.format(id1, id_)
    sql_manager(order)
    order = 'update bark set id = {} where id = {} and account_id = {}'.format(id1, id2, id_)
    sql_manager(order)
    order = 'update bark set id = {} where id = 0 and account_id = {}'.format(id2, id_)
    sql_manager(order)
    return make_resp('success')


@bark.route('/bark/alter/', methods=['POST'])
def alter():
    # post: code, id, name
    # return: success
    data = request.values
    code, bark_id, name = data.get('code'), data.get('id'), data.get('name')

    id_ = get_id_by_code(code)
    order = 'update bark set name = "{}" where account_id = {} and id = {};'.format(name, id_, bark_id)
    sql_manager(order)
    return make_resp('success')
