function formatNumber(num, n = 0) {
    if (num['__class__'] == 'BigNumber') {
        return BigNumberToStr(num, n)
    }
    if (num > 99999) {
        num = Math.floor(num);
        num = shortNumber(num);
    }
    else {
        num = Math.floor(num * 10 ** (-n)) / 10 ** (-n);
    };
    return num;
}

const shortNumber = (num) => {
    if (num !== 0) {
        var p = Math.floor(Math.log10(num));
        var n = num * (10 ** -p);
        n = n.toString().slice(0, 4)
        return `${n}e${p}`;
    }
    return 0
};

function killElementById(id) {
    document.getElementById(id).remove();
}

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

function setTextById(id, text) {
    document.getElementById(id).innerHTML = text;
}

function setTextByClass(className, text) {
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = text;
    }
}

function setBorderColorById(id, color) {
    var element = document.getElementById(id);
    if (element) { element.style.borderColor = color }
};

function showInfo(way, i) {
    infoNum = i;
    infoWay = way;
    if (way == 'thunderStorageBuy') {
        var percent = div_(gameData['thunder']['storage'], add_(gameData['thunder']['num'], gameData['thunder']['storage']));
        percent = BigNumberToFloat(mul_(percent, 1000));
        document.getElementById('infoBar').value = percent;
    }
    updateInfoBar();
    document.getElementById('info').hidden = false;
}

function getMax(price, source) {
    var n;
    var max;
    for (var i = 0; i < price.length; i++) {
        n = div_(source[i], price[i])
        if (!max) { max = n }
        else if (lt_(n, max)) { max = n }
    };
    return max
}

function checkEnough(price, source) {
    var k;
    if (Object.prototype.toString.call(price) == '[object Array]') {
        var s;
        for (var i = 0; i < price.length; i++) {
            s = div_(source[i], price[i]);
            if (!k) { k = s }
            else if (gt_(k, s)) { k = s };
        }
    }
    else {
        k = div_(source, price);
    };
    var color;
    if (gt_(1, k)) { color = 0 }
    else if (gt_(1.5, k)) { color = 1 }
    else if (gt_(2, k)) { color = 2 }
    else { color = 3 };
    return color;
}

function formatInfoNeed(price, source, name) {
    var colors = ['rgb(157, 74, 44)', 'rgb(218, 182, 52)', 'rgb(87, 112, 57)', 'rgb(15, 118, 121)'];
    var color = checkEnough(price, source);
    color = colors[color]
    var txt = '<span class="infoNeedItem" style="color: ' + color + ';">' +
        formatNumber(price) + name + ' </span>';
    return txt
}

function formatInfoTitle(title, speed) {
    var txt = '<span class="title">' + title + ' </span><span class="speed">' + speed + '</span>';
    return txt
}

function infoHide() {
    document.getElementById('info').hidden = true;
}

function alertInfo(title, content) {
    if (typeof (content) == 'string') { content = [content] };
    alertInfoNumber += 1;
    var txt = '';
    for (var i = 0; i < content.length; i++) {
        txt += content[i] + '<br>'
    }
    txt = '<div class="info tmpInfo" id="info' + alertInfoNumber + '">\
    <div class="title">'+ title + '</div>\
    <div class="speed">' + txt + '</div>\
    <button onclick="killElementById(\'info'+ alertInfoNumber + '\')">确认</button>\
    </div>';
    document.body.insertAdjacentHTML('beforeend', txt);
}


var alertInfoNumber = 0;
