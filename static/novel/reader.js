function jumpToProcess() {
    console.log('jump');
    var url = '/novel/process/';
    var code = localStorage.getItem('code');
    if (code == null) { return };
    data = 'code=' + code +
        '&id=' + getPar('id');
    post(url, data, function (resp) {
        if (parseInt(resp) != parseInt(getPar('chapter'))) {
            document.location.href = './reader.html?id=' + getPar('id') +
                '&chapter=' + resp;
        }
    });
}

function getText(afterGet) {
    var id = getPar('id');
    var data;
    var chapter = getPar('chapter');
    if (chapter == '') { jumpToProcess(); }
    else {
        var url = '/novel/text/';
        data = 'id=' + id + '&chapter=' + parseInt(chapter) + '&code=' + localStorage.getItem('code');
        post(url, data, function (resp) {
            var data = JSON.parse(resp);
            var title = data['title'];
            var text = data['text']
            if (title == 'exceed') {
                document.location.href = './reader.html?id=' + id + '&chapter=' + text;
            }
            else {
                document.getElementById('title').innerHTML = title;
                var txt = '';
                for (var i = 0; i < data['text'].length; i++) {
                    txt += '<div class="line">' + text[i] + '</div>';
                };
                document.getElementById('content').innerHTML = txt;
                afterGet();
            };
        });
    };
};

function getCurProcess() {
    var chapter = getPar('chapter');
    if (!chapter) { return };
    var chapter1 = getScrollPercent().toFixed(3);
    chapter = parseInt(chapter) + Math.min(0.999, chapter1);
    return chapter
}

function record() {
    if (!inited) { return };
    if (getTime() - lastRecord > 2 * 60 * 1000) {
        jumpToProcess();
    };
    var url = '/novel/record/';
    var data, code, id;
    var chapter = getCurProcess();
    if (!chapter) { return };
    if (chapter == lastPercent) { return }
    else { lastPercent = chapter };

    code = localStorage.getItem('code');
    if (code == null) { return }
    id = getPar('id')
    data = 'code=' + code +
        '&id=' + id +
        '&chapter=' + chapter;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('进度保存失败'); }
        else { lastRecord = getTime(); };
    })
};

function getScrollPercent() {
    var bodyHeight = document.body.scrollHeight;
    var windowHeight = window.innerHeight;
    var nowHeight = window.scrollY;
    if (windowHeight >= bodyHeight) { return 0 }
    var now = nowHeight / (bodyHeight - windowHeight);
    console.log('scrollPercent' + now)
    if (now > 1) {
        setTimeout(function () {
            if (getScrollPercent() == 1) { switchChapter(1) }
        }, 1000);
        return 1
    }
    return now
};

function switchChapter(page) {
    var chapter = parseInt(getPar('chapter')) + page
    if (chapter < 0) { chapter = 0 };
    document.location.href = './reader.html?id=' + getPar('id') + '&chapter=' + chapter;
};

function swtichToContent() {
    document.location.href = './content.html?id=' + getPar('id');
};

function getProcess() {
    var url = '/novel/process/';
    var code = localStorage.getItem('code');
    if (code == null) { return };
    data = 'code=' + code +
        '&id=' + getPar('id');
    post(url, data, function (resp) {
        resp = parseFloat(resp);
        if (Math.abs(resp - parseFloat(getPar('chapter'))) > 2) {
            if (confirm('是否返回原进度？')) {
                document.location.href = './reader.html?id=' + getPar('id') + '&chapter=' + resp;
                return;
            }
        }
        inited = true;
        if (Math.floor(resp) != parseInt(getPar('chapter'))) {
            record();
            return;
        };
        resp = resp % 1;
        var height = resp * (document.body.scrollHeight - window.innerHeight);
        scrollTo({
            top: height,
            behavior: 'smooth'
        });
    });
};

function getTime() {
    var a = new Date();
    return a.getTime();
};

function autoReadInit() {
    if (!autoReadOption) { return }
    else { document.getElementById('autoRead').hidden = false };

    autoReadSpeed = localStorage.getItem('autoReadSpeed');
    if (!autoReadSpeed) { autoReadSpeed = 40 }
    else { autoReadSpeed = parseFloat(autoReadSpeed) };

    autoReadFlag = localStorage.getItem('autoReadFlag');
    if (autoReadFlag == 'false') { autoReadFlag = false }

    if (autoScrollOption == 1) { autoScroll1() }
    else if (autoScrollOption == 2) { autoScroll2() }
    else { autoScroll1() };
}

function autoScroll1() {
    autoReadTime = getTime();
    setInterval(function () {
        if (!autoReadFlag) { return };

        var time1 = getTime();
        if (time1 - autoReadTime > 2 * 60 * 1000) { return };
        smoothScroll((time1 - autoReadTime) * autoReadSpeed / 1000);
        autoReadTime = time1;
    }, 100)
}

function autoScroll2() {
    if (autoReadFlag) {
        // smoothScroll(1);
        document.scrollingElement.scrollTop += 1;
    };
    setTimeout(autoScroll2, 1000 / autoReadSpeed);
}

function autoRead() {
    autoReadFlag = (!autoReadFlag);
    autoReadTime = getTime();
    localStorage.setItem('autoReadFlag', autoReadFlag);
}

function autoReadAdjust(dv) {
    if (autoReadSpeed < 5 && dv < 0) { alert('已调至最低') }
    else if (autoReadSpeed > 500 && dv > 0) { alert('已调至最高') }
    else {
        autoReadSpeed *= dv;
        localStorage.setItem('autoReadSpeed', autoReadSpeed);
    }
}

function autoReadScroll(height) {
    function scrollN(h, n) {
        if (n <= 0) { return }
        else {
            window.scrollBy(0, h);
            setTimeout(function () { scrollN(h, n - 1) }, 10)
        }
    }
    if (autoReadFlag) {
        autoReadFlag = false;
        setTimeout(function () {
            autoReadTime = getTime();
            autoReadFlag = true;
        }, 500);
    }
    scrollN(height / 20, 20)
}

var lastPercent = -1;
var lastRecord = getTime();
var autoReadFlag = false;
var autoReadSpeed;
var autoReadTime;
var inited = false;

if (getPar('chapter') == null) { checkLogged(); }
else if (getPar('chapter') > 10) { checkLogged(); }
else { };

addLoadEvent(function () { getText(getProcess) });
setInterval(record, 1000);
// onfocus = function () { if (getTime() - lastRecord > 2 * 60 * 1000) { jumpToProcess() } };
setTimeout(autoReadInit, 1000)
