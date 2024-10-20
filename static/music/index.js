function enter(event) {
    if (event.keyCode == "13") {
        search();
    };
}

function search() {
    var data = 'kw=' + getValueById('kw');
    var url = '/music/search/';
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        setResult(resp);
    })
}

function setResult(songs) {
    var txt = '';
    for (var i = 0; i < songs.length; i++) {
        txt += formatSong(songs[i]);
    };
    document.getElementById('result').innerHTML = txt
}

function formatSong(song) {
    return '<div class="item">' +
        '<div class="song">' + song['songName'] + '</div>' +
        '<div class="singer">' + song['artistName'] + '</div>' +
        '<div class="operation">' +
        '<button onclick="play(' + song['songId'] + ')">播放</button>' +
        '<button onclick="add(' + song['songId'] + ')">添加</button>' +
        '</div>' +
        '</div>'
}

function select(play = 1) {
    musicIdData = [];
    musicImgsData = [];  // 图片地址数组
    musicNameData = [];  // 歌曲名数组
    artistNameData = []  // 创作歌手数组
    musicUrls = [];  // 歌曲mp3数组
    var url = '/music/select/';
    var data = 'code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        var song;
        for (var i = 0; i < resp.length; i++) {
            song = resp[i];
            musicIdData.push(song['songId']);
            musicNameData.push(song['songName']);
            musicImgsData.push(song['imgUrl']);
            musicUrls.push(song['songUrl']);
            artistNameData.push(song['artistName']);
        };
        if (play) {
            currIndex = -1;
            showSheet();
            $('.next').click()
        }
    })
}

function add(songId) {
    var data = 'songId=' + songId +
        '&code=' + localStorage.getItem('code');
    var url = '/music/add/';
    post(url, data, function (resp) {
        if (resp != 'success') { alert('添加失败') }
        else { select(0) }
    })
}

function play(songId) {
    var data = 'songId=' + songId;
    var url = '/music/listen/';
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        console.log(resp);

        var index = musicIdData.indexOf(songId+'');
        if (index == -1) {
            musicIdData.unshift(resp['imgId']);
            musicImgsData.unshift(resp['imgUrl']);
            musicNameData.unshift(resp['songName']);
            artistNameData.unshift(resp['artistName']);
            musicUrls.unshift(resp['songUrl']);

            currIndex = -1;
        }
        else { currIndex = index - 1 };
        $('.next').click()
    })
}

function showSheet() {
    var txt = '';
    for (var i = 0; i < musicNameData.length; i++) {
        txt += '<div class="item">' +
            '<div class="song">' + musicNameData[i] + '</div>' +
            '<div class="singer">' + artistNameData[i] + '</div>' +
            '<div class="operation">' +
            '<button onclick="play(' + musicIdData[i] + ')">播放</button>' +
            '<button onclick="del(' + musicIdData[i] + ')">删除</button>' +
            '</div>' +
            '</div>'
    }
    document.getElementById('result').innerHTML = txt;
}

function del(id) {
    var url = '/music/del/';
    var data = 'code=' + localStorage.getItem('code') +
        '&songId=' + id;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('删除失败') }
        else {
            var k = musicIdData.indexOf(id + '');
            musicIdData.splice(k, 1);
            musicImgsData.splice(k, 1);
            musicNameData.splice(k, 1);
            artistNameData.splice(k, 1);
            musicUrls.splice(k, 1);
            showSheet();
        }
    })
}

function showPublic() {
    var url = '/music/select/';
    post(url, '', function (resp) {
        setResult(JSON.parse(resp))
    })
}


var musicIdData = [];
var musicImgsData = [];  // 图片地址数组
var musicNameData = [];  // 歌曲名数组
var artistNameData = []  // 创作歌手数组
var musicUrls = [];  // 歌曲mp3数组
var currIndex = -1;  // 当前播放索引
checkLogged();
select();