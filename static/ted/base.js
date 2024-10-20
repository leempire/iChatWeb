function setStyle() {
    var setting = localStorage.getItem('novelStyle');
    if (setting == null) { return };
    setting = JSON.parse(setting);

    colorScheme(setting['color']);
    fontFamily(setting['fontFamily']);
    fontSize(setting['fontSize']);
    fontWeight(setting['fontWeight']);
    lineHeight(setting['lineHeight']);
}

function colorScheme(scheme) {
    if (scheme == null) { return };
    var link = document.createElement('link');
    link.href = '../novle/colorScheme/' + scheme + '.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.id = 'colorScheme';
    document.head.insertAdjacentElement('beforeend', link);
}

function fontFamily(family) {
    if (family == null) { return };
    var txt;
    if (family == 'default') {
        txt = 'body{font-family: none}'
    }
    else {
        var url = '../novel/font/' + family;
        txt = '\
    @font-face {\
        font-family: ziti;\
        src: url('+ url + ');\
    }\
    body {\
        font-family: ziti;\
    }'};
    var fontStyle = document.createElement('style');
    fontStyle.innerHTML = txt;
    document.head.insertAdjacentElement('beforeend', fontStyle)
}

function fontSize(size) {
    if (size == null) { return };
    document.body.style.fontSize = size;
}

function fontWeight(weight) {
    if (weight == null) { return };
    var line = document.createElement('style');
    line.innerHTML = 'body{font-weight:' + weight + ';}'
    document.head.insertAdjacentElement('beforeend', line)
}

function lineHeight(height) {
    if (height == null) { return };
    var line = document.createElement('style');
    line.innerHTML = '.line{line-height: ' + height + '}'
    document.head.insertAdjacentElement('beforeend', line)
}

function getVideos(target) {
    let url = '/ted/videos/';
    let data = 'code=' + localStorage.getItem('code') +
        '&target=' + target;
    post(url, data, function (resp) {
        var books = JSON.parse(resp);
        var txt = '';
        for (var i = 0; i < books.length; i++) {
            txt += '<div class="chapter hover" onclick="switchToVideo(' +
                books[i][0] + ')">' + books[i][0] + '. ' + books[i][1] + '</div>'
        }
        document.getElementById('shelf').innerHTML = txt;
    });
};

function getVideosAll() {
    getVideos('all')
}

function getVideosWatched() {
    getVideos('watched')
}

function getVideosNotWatched() {
    getVideos('not watched')
}

function switchToVideo(id) {
    document.location.href = './watch.html?id=' + id;
}

var autoReadOption;
addLoadEvent(setStyle);