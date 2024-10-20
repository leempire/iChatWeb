function send() {
    var url = '/chat/send/';
    var msg = getValueById('msg');
    if (!msg) { return; };
    document.getElementById('msg').value = '';

    msg = order(msg);
    var data = {
        'code': localStorage.getItem('code'),
        'msg': JSON.stringify(msg)
    };
    data = JSON.stringify(data);

    var form = new FormData(document.getElementById('form'));
    form.append('data', data)

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
    xhr.onload = function () {
        if (xhr.response == 'success') { fetch() }
        else { alert('发送失败') }
    }
};

function order(msg) {
    if (msg[0] == '/') {
        var s = msg.slice(1).split(' ');
        if (s[0] == 'iframe') {
            var hint = s[1];
            if (s[2]) { hint = s[2] }
            msg = '<a href="javascript:openFrame(\'' + s[1] + '\')">' + hint + '</a>'
        }
        else if (s[0] == 'img') {
            msg = '<img src="' + s[1] + '" width="100%">'
        }
    }
    return msg
}

function openFrame(link) {
    var f0 = document.getElementById('frame0');
    if (f0) { f0.remove() };
    document.getElementById('window').innerHTML +=
        '<div id="frame0" style="height:90%">' +
        '<a href="javascript:document.getElementById(\'frame0\').remove()"> X </a>' +
        '<a href="' + link + '" target="_blank"> O </a>' +
        '<br/>' +
        '<iframe src="' + link + '" width="100%" height="90%"></iframe></div>';
    scrollToBottom();
}


function enter(event) {
    if (event.keyCode == "13") {
        send();
    };
};

function scrollToBottom() {
    var chatBox = document.getElementById('window')
    chatBox.scrollTop = chatBox.scrollHeight;
};

function fetch() {
    if (pin == null) { return; };
    var url = '/chat/fetch/';
    var data = 'pin=' + pin;
    pin = null;
    post(url, data, function (resp) {
        var data = JSON.parse(resp);
        pin = data['pin'];
        data = data['data'];
        var txt = '';
        for (var i = 0; i < data.length; i++) {
            txt += append(data[i]);
        };
        document.getElementById('window').innerHTML += txt;
        if (data.length) { scrollToBottom(); };
    });
};

function append(msg) {
    return '<div class="line"><div class="head h' +
        msg[3] + '">' +
        msg[0] + ' ' + msg[1] +
        '</div>' +
        '<img class="headImg" src="https://q.qlogo.cn/headimg_dl?bs=qq&dst_uin=' +
        msg[4] + '&spec=100">' +
        '<div class="content b' +
        msg[3] + '">' +
        msg[2] + '</div></div>';
};

var pin = 0;
checkLogged();
fetch();
setInterval(fetch, 1 * 1000);
