from .base import *

cloud = Blueprint('cloud', __name__)


@cloud.route('/cloud/upload/', methods=['POST'])
def upload():
    code = request.values.get('code')
    file = request.files.get('file')
    save_path = cloud_manager.store(file.filename, code=code)
    file.save(save_path)
    return make_resp('<script>window.parent.afterSubmit()</script>')


@cloud.route('/cloud/fetch/', methods=['POST'])
def fetch():
    # post: code
    # return: [[time, filename, location],...]
    data = request.values
    code = data.get('code')
    id_ = get_id_by_code(code)
    order = 'select create_time, filename, location from cloud where account_id = {} order by create_time'.format(id_)
    result = sql_manager(order)
    data = []
    for item in result:
        data.append([str(item[0]), item[1], item[2]])
    result = json.dumps(data)
    return make_resp(result)


@cloud.route('/cloud/delete/', methods=['POST'])
def delete():
    # post: location
    # return: success
    data = request.values
    location = data.get('location')
    cloud_manager.delete(location)
    return make_resp('success')
