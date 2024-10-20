function jumpTo(url) {
    document.location.href = url;
}

function gameList(name, target, action) {
    var url = '/game/list/';
    var data = 'name=' + name + '&target=' + target;
    post(url, data, action)
}

function addItem(name, count) {
    if (count == 1) { var name1 = name }
    else { var name1 = name }
    return '<div class="line">\
                <div class="id cell">'+ count + '</div>\
                <div class="filename cell">'+ name1 + '</div>\
                <div class="operation cell">\
                    <a href="./game/'+ name + '" download="./game/' + name + '.zip">下载</a>\
                </div>\
            </div>';
}


function setItem(gameName) {
    gameList(gameName, 'game', function (resp) {
        if (resp == 'error') { alert('获取版本错误') }
        else {
            resp = JSON.parse(resp);
            var txt = ''
            for (var i = 0; i < resp.length; i++) {
                txt += addItem(resp[i], i + 1)
            }
            document.getElementById('files').innerHTML = txt;
        }
    })
}

function addMapItem(name, count) {
    return '<div class="line">\
                <div class="id cell">'+ count + '</div>\
                <div class="filename cell">'+ name + '</div>\
                <div class="operation cell">\
                    <a href="./map/'+ name + '" download="./map/' + name + '.ichat">下载</a>\
                </div>\
            </div>';
}

function setMapItem(gameName) {
    gameList(gameName, 'map', function (resp) {
        if (resp == 'error') { alert('获取地图错误') }
        else {
            resp = JSON.parse(resp);
            var txt = '';
            for (var i = 0; i < resp.length; i++) {
                txt += addMapItem(resp[i], i + 1)
            }
            document.getElementById('files').innerHTML = txt;
        }
    })
}


var defaultIcon = '/favicon.ico';
checkLogged();
