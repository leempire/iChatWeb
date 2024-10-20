function point(point) {
    var url = '/game/wellChess/point/';
    var data = 'point=' + point;
    post(url, data, function (resp) {
        resp = JSON.parse(resp)
        formatDesk(resp['desk'])
        setState(resp['state'], 1 - count(resp['desk'], -1) % 2)
    })
}

function formatDesk(desk) {
    var color;
    for (var i = 0; i < desk.length; i++) {
        if (desk[i] == -1) { color = 'gray' }
        else { color = colors[desk[i]] };
        document.getElementById('cell' + i).style.backgroundColor = color;
    }
}

function setState(state, now) {
    console.log(state, now)
    var element = document.getElementById('msg');
    if (state == '0') {
        element.innerHTML = '请<div class="smallCell" style="background-color:'+colors[0]+'"></div>落子'
    }
    else if (state == '1') {
        element.innerHTML = '请<div class="smallCell" style="background-color:'+colors[1]+'"></div>落子'
    }
    else if (state == 'draw') {
        element.innerHTML = '平局'
    }
    else if (state == 'win') {
        element.innerHTML = '<div class="smallCell" style="background-color:'+colors[now]+'"></div>' + '获胜'
    }
}

function count(array_, target) {
    var c = 0;
    for (var i = 0; i < array_.lnegth; i++) {
        if (array_[i] == target) { c++ }
    }
    return c
}

var colors = ['rgb(19,211,106)', 'rgb(0,130,252)'];
setInterval(function () { point('desk') }, 1000);