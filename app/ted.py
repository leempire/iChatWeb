from .base import *

ted = Blueprint('ted', __name__)


@ted.route('/ted/videos/', methods=["POST"])
def videos():
    data = request.values
    code = data.get('code')
    target = data.get('target')
    account_id = get_id_by_code(code)
    if target == 'all':
        order = 'select id, title from ted_videos'
    elif target == 'watched':
        order = 'select id, title from ted_videos ' \
                'join ted_record on ted_videos.id = ted_record.video_id ' \
                'where account_id = {} order by time desc'.format(account_id)
    elif target == 'not watched':
        order = 'select id, title from ted_videos LEFT OUTER JOIN ted_record ' \
                'on id = video_id and account_id = {} where account_id is null'.format(account_id)
    else:
        return make_resp('')
    result = sql_manager(order)
    result = json.dumps(result)
    return make_resp(result)


@ted.route('/ted/video/', methods=["POST"])
def video():
    data = request.values
    code = data.get('code')
    id_ = data.get('id')
    account_id = get_id_by_code(code)
    order = 'select url from ted_videos where id = {}'.format(id_)
    result = sql_manager(order)[0][0]
    order = 'insert into ted_record values({}, {}, null) ' \
            'on duplicate key update time = current_timestamp;'.format(account_id, id_)
    sql_manager(order)
    return make_resp(result)
