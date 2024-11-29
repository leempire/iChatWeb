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
    return redirect('/static/index.html')


@root.route('/log/')
def log_():
    return redirect('/static/log/index.html')


@root.route('/favicon.ico')
def favicon():
    with open('static/favicon.ico', 'rb') as f:
        return f.read()


@root.errorhandler(404)
def error(e):
    return redirect('/static/index.html')


if __name__ == '__main__':
    if config['flask']['waitress']:
        from waitress import serve
        serve(root, host=config['flask']['host'], port=config['flask']['port'], threads=4)
    else:
        root.run(debug=config['flask']['debug'], host=config['flask']['host'], 
                 port=config['flask']['port'], threaded=config['flask']['threaded'])
