var account;

function switchTo(url) {
    document.location.href = url;
};

function getValueById(id) {
    return document.getElementById(id).value;
};

function checkLogged() {
    var code;
    code = localStorage.getItem('code');
    if (!code) {
        alert('请先完成登录');
        switchTo('/static/log/index.html?from=' + location.href);
    }
    else {
        var url, data;
        url = '/log/check/';
        data = 'code=' + code;
        post(url, data, function (resp) {
            if (resp == 'not found') {
                alert('账号发生变动，请重新登录');
                localStorage.removeItem('code');
                switchTo('/static/log/index.html?from=' + location.href)
            }
            else {
                account = resp;
                setName();
                console.log('logged');
            }
        });
    }
};

function post(url, data, action) {
    var xml;
    xml = new XMLHttpRequest();
    xml.open("POST", url, true);
    xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xml.send(data);
    xml.onload = function () {
        action(xml.response);
    };
};

function get(url, action) {
    var xml;
    xml = new XMLHttpRequest();
    xml.open("GET", url, true);
    xml.send();
    xml.onload = function () {
        action(xml.response);
    };
}

function setName() {
    var spans;
    spans = document.getElementsByClassName('name');
    for (var i = 0; i < spans.length; i++) {
        spans[i].innerHTML = account;
    };
};

function getPar(par) {
    //获取当前URL
    var local_url = document.location.href;
    //获取要取得的get参数位置
    var get = local_url.indexOf(par + "=");
    if (get == -1) {
        return '';
    }
    //截取字符串
    var get_par = local_url.slice(par.length + get + 1);
    //判断截取后的字符串是否还有其他get参数
    var nextPar = get_par.indexOf("&");
    if (nextPar != -1) {
        get_par = get_par.slice(0, nextPar);
    }
    return get_par;
};

function addLoadEvent(func) {
    //把现有的 window.onload 事件处理函数的值存入变量
    var oldOnload = window.onload;
    if (typeof window.onload != "function") {
        //如果这个处理函数还没有绑定任何函数，就像平时那样添加新函数
        window.onload = func;
    } else {
        //如果处理函数已经绑定了一些函数，就把新函数添加到末尾
        window.onload = function () {
            oldOnload();
            func();
        }
    }
}