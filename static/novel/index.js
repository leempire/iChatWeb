function getShelf() {
    var url, code, data;
    code = localStorage.getItem('code');
    url = '/novel/shelf/';
    data = 'code=' + code;
    post(url, data, function (resp) {
        var books = JSON.parse(resp);
        var txt = '';
        for (var i = 0; i < books.length; i++) {
            txt += '<div class="chapter hover" onclick="switchToBook(' +
                books[i][0] + ')">' + getName(books[i]) + '</div>'
        }
        document.getElementById('shelf').innerHTML = txt;
    });
};

function formatTime(sec) {
    sec = parseInt(sec);
    if (sec < 60) { return sec + '秒' };
    var mini = parseInt(sec / 60);
    if (sec < 3600) { return mini + '分钟 ' + sec % 60 + '秒' };
    var hour = parseInt(mini / 60);
    if (mini < 24 * 60) { return hour + '小时 ' + mini % 60 + '分钟' };
    var day = parseInt(hour / 24);
    return day + '天 ' + hour % 24 + '小时';
}

function getName(book) {
    var t = book[2];
    return book[1] + '（已读' + formatTime(t) + '）'
}

function switchToBook(id) {
    document.location.href = './reader.html?id=' + id;
}

checkLogged();
getShelf();