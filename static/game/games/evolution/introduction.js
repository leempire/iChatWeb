function switchItem(i) {
    var item = document.getElementById('item' + i);
    item.hidden = !item.hidden;
}

function getItem(i) {
    get('./introduction/' + titles[i] + '.txt', function (resp) {
        resp = resp.replace(/\n/g, '<br>');
        document.getElementById('item' + i).innerHTML = resp
    });
    document.getElementById('itemTitle' + i).onclick = function () { switchItem(i) };
    switchItem(i);
}

function loadTitle() {
    get('./introduction.txt', function (resp) {
        titles = resp.split('\n');
        var txt = '';
        for (var i = 0; i < titles.length; i++) {
            txt += '<div class="item">\
            <div class="title" onclick="getItem('+ i + ')" id="itemTitle' + i + '">\
                '+ titles[i] +
                '</div>\
            <div class="speed" id="item'+ i + '" hidden></div>\
        </div>'
        }
        document.getElementById('items').innerHTML = txt;
    })
}

var titles = [];
onload = loadTitle;
