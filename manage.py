from app import *

root = Flask(__name__)
root.register_blueprint(log)
root.register_blueprint(novel)
root.register_blueprint(cloud)
root.register_blueprint(chat)
root.register_blueprint(music)
root.register_blueprint(diary)
root.register_blueprint(bark)
root.register_blueprint(game)
root.register_blueprint(salt)
root.register_blueprint(ted)
root.logger.addHandler(logger)


def get_proxy_prefix():
    """获取代理路径前缀，如果通过nginx代理访问则返回/ichat，否则返回空字符串"""
    script_name = request.environ.get('HTTP_X_SCRIPT_NAME', '')
    forwarded_prefix = request.environ.get('HTTP_X_FORWARDED_PREFIX', '')
    
    # 优先使用X-Script-Name头
    if script_name:
        return script_name.rstrip('/')
    # 其次使用X-Forwarded-Prefix头
    elif forwarded_prefix:
        return forwarded_prefix.rstrip('/')
    
    return ''


def make_proxy_aware_redirect(url):
    """创建代理感知的重定向URL"""
    prefix = get_proxy_prefix()
    
    # 如果URL已经是绝对路径或外部URL，直接返回
    if url.startswith('http') or url.startswith('//'):
        return redirect(url)
    
    # 确保URL以/开头
    if not url.startswith('/'):
        url = '/' + url
    
    # 添加代理前缀
    if prefix:
        url = prefix + url
    
    return redirect(url)


@root.route('/place/')
def place():
    ip = request.remote_addr
    url = 'https://ip.900cha.com/{}.html'.format(ip)
    try:
        bug = Bug(url)
        ft = bug.find('class="list-unstyled mt-3"')
        city = ft.findall('<li')[-1].get_text('\r\t\n')
        city = city[city.find('>') + 1:]
    except Exception:
        city = 'fail'
    return make_resp(city)


@root.route('/video/get/', methods=['POST'])
def get_video_url():
    # post: code, url
    # return: url
    data = request.values
    code = data.get('code')
    if not get_id_by_code(code):
        return make_resp('not logged')
    url = data.get('url')
    urls = ['https://jx.we-vip.com/?url={}', 'https://svip.bljiex.cc/?v={}']
    urls = [item.format(url) for item in urls]
    return make_resp(urls)


@root.route('/')
def index():
    return make_proxy_aware_redirect('/static/index.html')


@root.route('/log/')
def log_():
    return make_proxy_aware_redirect('/static/log/index.html')


@root.route('/favicon.ico')
def favicon():
    with open('static/favicon.ico', 'rb') as f:
        return f.read()


@root.errorhandler(404)
def error(e):
    return make_proxy_aware_redirect('/static/index.html')


if __name__ == '__main__':
    if config['flask']['waitress']:
        from waitress import serve
        serve(root, host=config['flask']['host'], port=config['flask']['port'], threads=4)
    else:
        root.run(debug=config['flask']['debug'], host=config['flask']['host'], 
                 port=config['flask']['port'], threaded=config['flask']['threaded'])
