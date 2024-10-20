function loadBarks() {
    var url = '/bark/get/';
    var data = 'code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        var txt = '';
        resp = JSON.parse(resp);
        for (var i = 0; i < resp.length; i++) {
            txt += addWeb(resp[i], i + 1);
        };
        txt += '<div class="add line">\
            <button onclick="add()">添 加 书 签</button>\
        </div>'
        document.getElementById('files').innerHTML = txt;
    })
}

function addWeb(item, num) {
    return '<div class="line">\
    <div class="id cell">'+ num + '</div>\
    <div class="icon cell">\
        <img src="'+ item[1] + '" onerror="this.src=defaultIcon">\
    </div>\
    <div class="filename cell">'+ item[2] + '</div>\
    <div class="operation cell">\
    <button onclick="rename('+ item[3] + ')">改名</button>\
        <button onclick="up('+ item[3] + ')">上移</button>\
        <button onclick="del('+ item[3] + ')">删除</button>\
    </div>\
    </div>'
}

function up(id) {
    var url = '/bark/up/';
    var data = 'code=' + localStorage.getItem('code') +
        '&id=' + id;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('上移失败') }
        else {
            loadBarks();
        }
    })
}

function del(id) {
    var url = '/bark/delete/';
    var data = 'code=' + localStorage.getItem('code') +
        '&id=' + id;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('删除失败') }
        else {
            loadBarks();
        }
    })
}

function add() {
    var url1 = prompt('请输入网址');
    if (!url1) { return };
    var name = prompt('请输入名称');
    if (!name) { name = '未命名' }
    var url = '/bark/add/';
    var data = 'code=' + localStorage.getItem('code') +
        '&url=' + url1 + '&name=' + name;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('添加失败') }
        else {
            loadBarks();
            alert('添加成功')
        }
    })
}

function rename(id) {
    var name = prompt('请输入名称');
    if (!name) { return };
    var url = '/bark/alter/';
    var data = 'code=' + localStorage.getItem('code') +
        '&id=' + id +
        '&name=' + name;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('改名失败') }
        else {
            loadBarks();
        }
    })
}

var defaultIcon = '/favicon.ico';
checkLogged();
onload = loadBarks;