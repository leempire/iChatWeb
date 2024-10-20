import re

import requests

from .base import *

music = Blueprint('music', __name__)


@music.route('/music/search/', methods=['POST'])
def search():
    """输入歌名，返回歌曲搜索结果"""
    kw = request.values.get('kw')
    text = requests.get('http://cloud-music.pl-fe.cn/search?keywords={}'.format(kw)).text
    dictionary = json.loads(text)
    songs = dictionary['result']['songs']
    result = []
    for song in songs:
        message = {
            'songId': song['id'],
            'songName': song['name'],
            'artistName': '、'.join([artist['name'] for artist in song['artists']]),
        }
        result.append(message)
    return make_resp(result)


@music.route('/music/listen/', methods=['POST'])
def listen():
    song_id = request.values.get('songId')

    url = 'https://music.163.com/song?id={}'.format(song_id)
    bug = Bug(url)
    title = bug.find('name="description"')['content']
    song_name = re.findall(r'歌曲名《(.*?)》', title)[0]
    song_url = 'https://music.163.com/song/media/outer/url?id={}.mp3'.format(song_id)
    artist_name = re.findall(r'由 (.*?) 演唱', title)[0]
    img_url = bug.find('property="og:image"')['content']

    urls = {
        'songId': song_id,
        'songName': song_name,
        'imgUrl': img_url,
        'songUrl': song_url,
        'artistName': artist_name,
    }
    return make_resp(urls)


@music.route('/music/add/', methods=['POST'])
def add():
    # post: code, songId
    # return: success
    data = request.values
    code = data.get('code')
    song_id = request.values.get('songId')

    id_ = get_id_by_code(code)

    url = 'https://music.163.com/song?id={}'.format(song_id)
    bug = Bug(url)
    title = bug.find('name="description"')['content']
    song_name = re.findall(r'歌曲名《(.*?)》', title)[0]
    song_url = 'https://music.163.com/song/media/outer/url?id={}.mp3'.format(song_id)
    artist_name = re.findall(r'由 (.*?) 演唱', title)[0]
    img_url = bug.find('property="og:image"')['content']

    order = 'select id from songs where song_id = "{}"'.format(song_id)
    result = sql_manager(order)
    if not result:
        order = 'insert into songs values(null, "{}", "{}", "{}", "{}", "{}");'.format(
            song_id, song_name, img_url, song_url, artist_name)
        sql_manager(order)
        order = 'select id from songs where song_id = "{}"'.format(song_id)
        song_id = sql_manager(order)[0][0]
    else:
        song_id = result[0][0]

    order = 'select * from song_sheet where account_id = {} and song_id = "{}";'.format(id_, song_id)
    if not sql_manager(order):
        order = 'insert into song_sheet values({}, "{}");'.format(id_, song_id)
        sql_manager(order)
    return make_resp('success')


@music.route('/music/select/', methods=['POST'])
def select():
    # post: code
    # return: [[]]
    data = request.values
    code = data.get('code')

    if not code:
        order = 'select song_id, song_name, img_url, song_url, artist_name from songs;'
        result = sql_manager(order)
        aa = []
        for bb in result:
            item = {
                'songId': bb[0],
                'songName': bb[1],
                'imgUrl': bb[2],
                'songUrl': bb[3],
                'artistName': bb[4],
            }
            aa.append(item)
    else:

        id_ = get_id_by_code(code)

        order = 'select song_id from song_sheet where account_id = {};'.format(id_)
        result = sql_manager(order)
        aa = []
        for song_id in result:
            order = 'select song_id, song_name, img_url, song_url, artist_name from songs where id = {}'.format(song_id[0])
            bb = sql_manager(order)[0]
            bb = {
                'songId': bb[0],
                'songName': bb[1],
                'imgUrl': bb[2],
                'songUrl': bb[3],
                'artistName': bb[4],
            }
            aa.append(bb)
    return make_resp(aa)


@music.route('/music/del/', methods=['POST'])
def delete():
    # post: code, songId
    # return: success
    data = request.values
    code = data.get('code')
    song_id = data.get('songId')

    id_ = get_id_by_code(code)
    order = 'select id from songs where song_id = {};'.format(song_id)
    song_id = sql_manager(order)[0][0]
    order = 'delete from song_sheet where account_id = {} and song_id = {};'.format(id_, song_id)
    sql_manager(order)
    return make_resp('success')


if __name__ == '__main__':
    search('夏日海岛')
