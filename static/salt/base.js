function getContent() {
    var url = '/salt/getContent/';
    post(url, '', function (resp) {
        resp = JSON.parse(resp);
        addContent(resp)
    })
}

function addContent(items) {
    var item;
    var txt = '';
    for (var i = 0; i < items.length; i++) {
        item = items[i];
        txt += '<div class="chapter hover">\
            <a href="./reader.html?id='+ item[0] + '">' + item[1] + '\
            </a>\
        </div>';
    }
    document.getElementById('shelf').innerHTML = txt;
}

function getText() {
    var id = getPar('id');
    var url = '/salt/text/';
    var data = 'id=' + id;
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        document.getElementById('title').innerHTML = resp[0];
        var txt = '';
        for (var i = 1; i < resp.length; i++) {
            txt += '<div class="line">' + resp[i] + '</div>';
        };
        document.getElementById('content').innerHTML = txt;
    })
}

function swtichToContent() {
    switchTo('./index.html')
}

function switchChapter() { }

checkLogged();
