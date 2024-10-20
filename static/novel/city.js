function getCity() {
    var url;
    url = '/novel/city/';
    post(url, '', function (resp) {
        var books = JSON.parse(resp);
        var txt = '';
        for (var i = 0; i < books.length; i++) {
            txt += '<div class="chapter hover" onclick="add(' +
                books[i][0] + ')">' + books[i][1] + '</div>'
        }
        document.getElementById('shelf').innerHTML = txt;
    });
};

function add(id) {
    var url, data;
    url = '/novel/add/';
    data = 'code=' + localStorage.getItem('code') +
        '&id=' + id;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('出现错误'); return; }
        var url = './content.html?id=' + id;
        document.location.href = url;
    });
};

function downloadBook(id) {
    var url, data;
    url = '/novel/download/'
    data = 'code=' + localStorage.getItem('code') +
    '&id=' + id;
    post(url, data, function(resp){
        if (resp != 'success') { alert('出现错误'); return; }
        alert('处理完成后将保存到云盘，请在一分钟后查看')
    })
}

checkLogged();
addLoadEvent(getCity);