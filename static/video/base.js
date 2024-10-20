function getUrl() {
    var device = navigator.userAgent.toLowerCase();
    if (/iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(device)) {
        //移动端
        alert('请使用电脑访问');
        return;
    };

    var value = document.getElementById('videoUrl').value;
    var url = '/video/get/';
    var data = 'code=' + localStorage.getItem('code') +
        '&url=' + value;
    post(url, data, function (resp) {
        var element = document.getElementById('iframe');
        urls = JSON.parse(resp);
        element.src = urls[0];
        adjust();
        pin = 0;
    })
}

function adjust() {
    var frame = document.getElementById('iframe');
    var targetWidth = frame.scrollHeight * 16 / 9;
    if (window.innerWidth * 0.97 >= targetWidth) {
        frame.style.width = targetWidth + 'px';
    }
    else {
        targetWidth = window.innerWidth * 0.97;
        frame.style.width = targetWidth + 'px';
        document.getElementById('videoFrame').style.height = targetWidth * 9 / 16 + 'px';
    }
}

function switchPin() {
    pin += 1;
    if (pin >= urls.length) { pin = 0 };
    var element = document.getElementById('iframe');
    element.src = urls[pin];
}

function clearImg() {
    var imgs = document.getElementsByTagName('img');
    for (var i = 0; i < imgs.length; i++) {
        imgs[i].remove();
    }
}


setInterval(clearImg, 100)
checkLogged();
addLoadEvent(adjust);
var urls = [];
var pin = 0;
