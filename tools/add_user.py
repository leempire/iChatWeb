from base import sql_manager, get_code
import argparse

parser = argparse.ArgumentParser()

parser.add_argument('account', type=str, help='account')
parser.add_argument('password', type=str, help='password')
parser.add_argument('email', type=str, nargs='?', help='email', default='null')

args = parser.parse_args()


def add_user(account, password, email=None):
    # 检查用户名、邮箱是否已存在
    order = 'select id from accounts where account="{}"'.format(account)
    if sql_manager(order):
        print('用户名已存在')
        return
    if email is None or email == 'null':
        email = 'null'
    else:
        order = 'select id from accounts where email="{}"'.format(email)
        print('邮箱已存在')
        return

    code = get_code()

    if email == 'null':
        order = 'insert into accounts(account, password, code) values("{}", "{}", "{}");'.format(account, password, code)
    else:
        order = 'insert into accounts(account, password, email, code) values("{}", "{}", "{}", "{}");'.format(account, password, email, code)

    try:
        sql_manager(order)
        print('成功创建用户：\n {}\n {}\n {}'.format(account, password, email))
    except Exception:
        print('用户创建失败')


add_user(args.account, args.password, args.email)
