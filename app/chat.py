from .base import *

chat = Blueprint('chat', __name__)


@chat.route('/chat/fetch/', methods=['POST'])
def fetch():
    # post: [pin]
    # return {'data': ,'pin': }
    data = request.values
    pin = data.get('pin')
    if pin == '0':
        order = 'select count(id) from chat where time < curdate() - 7;'
        result = sql_manager(order)
        if not result:
            pin = 1
        else:
            pin = result[0][0]
    else:
        pin = int(pin)
    order = 'select id, account, email from accounts;'
    names = dict()
    for item in sql_manager(order):
        names[item[0]] = [item[1], item[2].split('@')[0]]

    order = 'select * from bubble;'
    bubble = dict()
    for item in sql_manager(order):
        bubble[item[0]] = item[1]

    order = 'select time, account_id, msg from chat where id > {};'.format(pin)
    result = sql_manager(order)
    data = []
    for item in result:
        time, account_id, msg = item
        if account_id in bubble:
            bubble_id = bubble[account_id]
        else:
            bubble_id = 0
        name, qq = names[account_id]
        data.append([str(time), name, msg, bubble_id, qq])
    return make_resp(json.dumps({'data': data, 'pin': pin + len(data)}))


@chat.route('/chat/send/', methods=['POST'])
def send():
    # post: code, msg
    # return: success
    data = request.json
    code, msg = data['code'], data['msg']
    order = 'select id from accounts where code = {};'.format(code)
    id_ = sql_manager(order)[0][0]
    order = 'insert into chat(account_id, msg) values({}, {});'.format(id_, msg)
    sql_manager(order)
    return make_resp('success')
