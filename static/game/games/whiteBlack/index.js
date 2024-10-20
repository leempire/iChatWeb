function generateDeck() {
    var deck = document.getElementById('deck');
    var txt = ''
    for (var i = 0; i < 8; i++) {
        txt += '<div class="row">'
        for (var j = 0; j < 8; j++) {
            txt += '<div class="cell ';
            if ((i + j) % 2) { txt += 'bg0' }
            else { txt += 'bg1' }
            txt += '" id="cell' + j + i;
            txt += '" onclick="drop(' + j + ',' + i + ')"></div>'
        }
        txt += '</div>'
    }
    deck.innerHTML = txt;
}

function setBlock(x, y, t) {
    if (t == 0) {
        document.getElementById('cell' + x + y).innerHTML = '<div class=""></div>';
    }
    else if (t == 1) {  // 黑子
        document.getElementById('cell' + x + y).innerHTML = '<div class="black"></div>';
    }
    else if (t == 2) {  // 白子
        document.getElementById('cell' + x + y).innerHTML = '<div class="white"></div>';
    }
    else if (t == 3) {  // 提示
        document.getElementById('cell' + x + y).innerHTML = '<div class="prompt"></div>';
    }
    else if (t == 4) {  // 被翻转
        document.getElementById('cell' + x + y).children[0].classList.add('reversal')
    }
    else if (t == 5) {  // 刚下的
        document.getElementById('cell' + x + y).children[0].classList.add('newest')
    }
}

function getState() {
    var url = '/game/whiteBlack/getState/';
    var data = '';
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        loadState(resp)
    })
}

function loadState(state) {
    setText(state);
    var deck = state['deck'];
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            setBlock(i, j, deck[i][j])
        }
    }
    if (state['now'] == 1) {
        var blackAble = state['blackAble'];
        for (var i = 0; i < blackAble.length; i++) {
            var p = blackAble[i];
            setBlock(p[0], p[1], 3);
        }
    }
    else {
        var whiteAble = state['whiteAble'];
        for (var i = 0; i < whiteAble.length; i++) {
            var p = whiteAble[i];
            setBlock(p[0], p[1], 3);
        }
    }
    var lastChange = state['lastChange'];
    for (var i = 0; i < lastChange.length; i++) {
        var p = lastChange[i];
        setBlock(p[0], p[1], 4);
    }
    var lastDrop = state['lastDrop'];
    if (lastDrop) { setBlock(lastDrop[0], lastDrop[1], 5); }
}

function drop(x, y) {
    var url = '/game/whiteBlack/drop/';
    var data = 'point=' + [x, y];
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        loadState(resp)
    })
}

function reset() {
    var url = '/game/whiteBlack/reset/';
    var data = '';
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        loadState(resp)
    })
}

function ai() {
    var url = '/game/whiteBlack/ai/';
    var data = '';
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        loadState(resp)
    })
}

function setText(state, now) {
    var now = state['now'];
    var blackWhiteNum = state['blackWhiteNum'];
    var txt = '';
    txt += '<div id="side1" class="cbox'
    if (now == 1) { txt += ' side' }
    txt += '">'
    txt += '<span>' + blackWhiteNum[0] + '</span><div class="black"></div></div>'

    txt += '<div id="side2" class="cbox'
    if (now == 2) { txt += ' side' }
    txt += '">'
    txt += '<span>' + blackWhiteNum[1] + '</span><div class="white"></div></div>'

    txt += '<div id="play" class="button" onclick="reset()">重置</div>';
    
    if (state['ai'] == 0) { txt += '<div id="aiButton" onclick="ai()">AI(关)</div>' }
    else if (state['ai'] == 1) { txt += '<div id="aiButton" onclick="ai()">AI(黑)</div>' }
    else if (state['ai'] == 2) { txt += '<div id="aiButton" onclick="ai()">AI(白)</div>' }
    
    document.getElementById('console').innerHTML = txt;
}

var colors = ['rgb(19,211,106)', 'rgb(0,130,252)'];
addLoadEvent(generateDeck);
addLoadEvent(getState);
setInterval(function () { getState() }, 1000);