function getShelf() {
    var url, code, data;
    code = localStorage.getItem('code');
    url = '/novel/shelf/';
    data = 'code=' + code;
    post(url, data, function (resp) {
        var books = JSON.parse(resp);
        var txt = '<option value="0" selected>请选择</option>';
        for (var i = 0; i < books.length; i++) {
            txt += '<option value="' + books[i][0] + '">' + books[i][1] + '</option>'
        }
        document.getElementById('bookName').innerHTML = txt;
    });
};

function stat() {
    var bookId = getValueById('bookName');
    if (bookId == 0) { return }
    var url = '/novel/stat/';
    var data = 'code=' + localStorage.getItem('code') +
        '&id=' + bookId;
    post(url, data, function (resp) {
        if (resp == 'error') { alert('出现错误') };
        resp = JSON.parse(resp);
        var txt = '';
        for (var k in resp) {
            txt += '\
            <div class="row">\
                <div class="column">'+ k + '</div>\
                <div class="column">'+ resp[k] + '</div>\
            </div>'
        };
        document.getElementById('data').innerHTML = txt;
    })
}

addLoadEvent(getShelf);
