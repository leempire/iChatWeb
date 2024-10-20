from .base import *

log = Blueprint('log', __name__)


@log.route('/log/register/', methods=['POST'])
def register():
    # post: account, password, email, code
    # return: code wrong, email registered, account existed, success
    data = request.values
    account, password, email, code = data.get('account'), data.get('password'), data.get('email'), data.get('code')
    order = 'select email from confirm where code = "{}" order by id desc'.format(code)
    result = sql_manager(order)
    if not result:
        return make_resp('code wrong')

    result = result[0][0]
    if result != email:
        return make_resp('code wrong')

    order = 'select id from accounts where email = "{}";'.format(email)
    if sql_manager(order):
        return make_resp('email registered')
    order = 'select id from accounts where account = "{}";'.format(account)
    if sql_manager(order):
        return make_resp('account existed')

    code = get_code()
    order = 'insert into accounts(account, password, email, code) ' \
            'values("{}", "{}", "{}", "{}");'.format(account, password, email, code)
    sql_manager(order)
    return make_resp('success')


@log.route('/log/confirm/', methods=['POST'])
def confirm():
    # post: email
    # return: success
    data = request.values
    email = data.get('email')
    code = str(random.random())[2:8]
    order = 'insert into confirm(email, code) values("{}", "{}")'.format(email, code)
    sql_manager(order)
    try:
        sender = EmailSender()
        sender.set_message('iChat协会', '您正在进行邮箱验证，验证码为: {}'.format(code))
        sender.send_message(email)
        return make_resp('success')
    except Exception:
        return make_resp('send email error')


@log.route('/log/alter/', methods=['POST'])
def alter():
    # post: account, password, new_password
    # return: account not exist, password wrong, success
    data = request.values
    account, password, new_password = data.get('account'), data.get('password'), data.get('new_password')
    order = 'select id from accounts where account = "{}";'.format(account)
    id_ = sql_manager(order)
    if not id_:
        return make_resp('account not exist')

    id_ = id_[0][0]
    order = 'select password from accounts where id = {};'.format(id_)
    p = sql_manager(order)[0][0]
    if p != password:
        return make_resp('password wrong')

    code = get_code()
    order = 'update accounts set password = "{}", code = "{}" where id = {};'.format(new_password, code, id_)
    sql_manager(order)
    code_id[code] = id_
    return make_resp('success')


@log.route('/log/login/', methods=['POST'])
def login():
    # post: account, password
    # return: account not exist, password wrong, code
    data = request.values
    account, password = data.get('account'), data.get('password')
    order = 'select id from accounts where account = "{}";'.format(account)
    id_ = sql_manager(order)
    if not id_:
        return make_resp('account not exist')

    id_ = id_[0][0]
    order = 'select password from accounts where id = {};'.format(id_)
    p = sql_manager(order)[0][0]
    if p != password:
        return make_resp('password wrong')

    order = 'select code from accounts where id = {};'.format(id_)
    code = sql_manager(order)[0][0]
    return make_resp(code)


@log.route('/log/check/', methods=['POST'])
def check():
    # post: code
    # return: not found, account
    data = request.values
    code = data.get('code')
    order = 'select account from accounts where code = "{}";'.format(code)
    account = sql_manager(order)
    if not account:
        return make_resp('not found')
    account = account[0][0]
    return make_resp(account)


@log.route('/log/find/', methods=['POST'])
def find():
    # post: email
    # return: success, email not exist, send email error
    data = request.values
    email = data.get('email')
    order = 'select account, password from accounts where email = "{}";'.format(email)
    result = sql_manager(order)
    if not result:
        return make_resp('email not exist')
    account, password = result[0]
    try:
        sender = EmailSender()
        sender.set_message('iChat协会', '已为您找回账号！\n账号: {}；\n密码: {}'.format(account, password))
        sender.send_message(email)
        return make_resp('success')
    except Exception:
        return make_resp('send email error')

