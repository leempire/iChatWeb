function addWeb(item) {
    return '<div class="line hover" onclick="jumpTo(\'' + item[0] + '\')">\
    <img src="'+ item[1] + '" onerror="this.src=defaultIcon"> ' + item[2] + '\
</div>';
}

function jumpTo(url) {
    document.location.href = url;
}

function loadBarks() {
    var url = '/bark/get/';
    var data = 'code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        var txt = '';
        resp = JSON.parse(resp);
        if (resp.length == 0) { jumpTo('./set.html') };
        for (var i = 0; i < resp.length; i++) {
            txt += addWeb(resp[i]);
        };
        document.getElementById('box').innerHTML = txt;
    })
}

var defaultIcon = '/favicon.ico';
checkLogged();
onload = loadBarks;