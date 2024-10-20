from .base import *
from .game_base import *

game = Blueprint('game', __name__)


@game.route('/game/list/', methods=['POST'])
def list_game():
    # post: name
    # return: [v1, v2, ...]
    data = request.values
    name = data.get('name')
    target = data.get('target')
    root = 'static/game/games/{}/{}'.format(name, target)
    if not os.path.exists(root):
        return make_resp('error')
    else:
        files = os.listdir(root)
        return make_resp(files)


@game.route('/game/evolution/update/', methods=['POST'])
def evolution_update():
    # post: code
    # return: data
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code, announce=False)
    if id_ is None:
        return
    data, msg = evo_manager.update(id_)
    return make_resp([data, msg])


@game.route('/game/evolution/buy/', methods=['POST'])
def evolution_buy():
    # post: code, way, num, itemNum
    # return: success
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code, announce='evolutionBuy')
    if id_ is None:
        return
    way = data.get('way')
    item_num = data.get('itemNum')
    num = data.get('num').replace(' ', '')
    resp = evo_manager.buy(id_, way, item_num, num)
    return make_resp(resp)


@game.route('/game/evolution/autoBuy/', methods=['POST'])
def evolution_auto_buy():
    # post: code, way, num, itemNum
    # return: success
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code, announce='evolutionAutoBuy')
    if id_ is None:
        return
    resp = evo_manager.auto_buy(id_)
    return make_resp(resp)


@game.route('/game/evolution/rank/', methods=['POST'])
def evolution_rank():
    # post: code
    # return: [[name, item, num]]
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code, announce='evolutionRank')
    ranks = evo_manager.rank(id_)
    for i, row in enumerate(ranks):
        order = 'select account from accounts where id = {};'.format(row[0])
        name = sql_manager(order)[0][0]
        ranks[i][0] = name
    ranks = json_dumps(ranks)
    dirn = 'static/game/games/evolution/introduction'
    files = os.listdir(dirn)
    with open(dirn+'.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(os.path.splitext(file)[0] for file in files))
    return make_resp(ranks)


@game.route('/game/wellChess/point/', methods=['POST'])
def well_chess():
    # post: point
    # return: desk
    data = request.values
    point = data.get('point')
    if point == 'desk':
        resp = well_chess_manager.drop()
    else:
        resp = well_chess_manager.drop(int(point))
    return make_resp(resp)


@game.route('/game/whiteBlack/getState/', methods=['POST'])
def whiteBlack_getState():
    # post: none
    # return: state
    state = whiteBlack.get_state()
    return make_resp(state)


@game.route('/game/whiteBlack/drop/', methods=['POST'])
def whiteBlack_drop():
    # post: point(x, y)
    # return: state
    data = request.values
    point = data.get('point')
    x, y = [int(i) for i in point.split(',')]
    try:
        whiteBlack.drop(x, y)
    except Exception:
        return make_resp('error')
    state = whiteBlack.get_state()
    return make_resp(state)


@game.route('/game/whiteBlack/reset/', methods=['POST'])
def whiteBlack_reset():
    # post: none
    # return: state
    whiteBlack.reset()
    state = whiteBlack.get_state()
    return make_resp(state)


@game.route('/game/whiteBlack/ai/', methods=['POST'])
def whiteBlack_ai():
    # post: none
    # return: state
    whiteBlack.ai += 1
    if whiteBlack.ai == 3:
        whiteBlack.ai = 0
    whiteBlack.ai_update()
    state = whiteBlack.get_state()
    return make_resp(state)
