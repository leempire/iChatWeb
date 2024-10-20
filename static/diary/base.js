var diaries, cates;

function fetch() {
    var url = '/diary/fetch/';
    var data = 'code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        diaries = resp['diary'];
        cates = resp['cate'];
        setSelect();
        setMyDiary();
    })
}

function fetchByCate() {
    var targetCate = [];
    var selectCate = document.getElementById('selectByCate').children;
    for (var i = 0; i < selectCate.length; i++) {
        if (selectCate[i].checked) {
            targetCate.push(selectCate[i].value)
        };
    };
    setMyDiary(targetCate);
}

function setCode() {
    var es = document.getElementsByClassName('code');
    for (var i = 0; i < es.length; i++) {
        es[i].value = localStorage.getItem('code')
    };
}

function delDiary(id) {
    var url = '/diary/delDiary/';
    var data = 'code=' + localStorage.getItem('code') +
        '&id=' + id;
    post(url, data, function (resp) {
        if (resp == 'success') { fetch() }
        else { alert('删除失败') }
    })
}

function setSelect() {
    var select = document.getElementsByClassName('cate');
    var txt = formatSelect({});
    for (var i = 0; i < select.length; i++) {
        select[i].innerHTML = txt
    };
}

function formatSelect(choose) {
    var txt = '';
    for (var key in cates) {
        txt += cates[key] + '<input type="checkbox" name="cate" value="' + key + '"'
        if (key in choose) {
            txt += ' checked="checked">'
        }
        else { txt += '>' }
    };
    return txt
}

function getDiaryForAlter() {
    var form = document.alterDiary;
    var diary = form.id.value;
    for (var i = 0; i < diaries.length; i++) {
        if (diaries[i][0] == diary) { diary = diaries[i][1] }
    };
    form.time.value = diary[0];
    form.title.value = diary[1];
    form.content.value = diary[2];
}

function setMyDiary(targetCate) {
    var mydiary = document.getElementsByClassName('myDiary')[0];
    var txt = '<div class="diary diaryHead">\
    <div class="diaryTitle headCell">标题</div>\
    <div class="diaryDate headCell">日期</div>\
    <div class="open headCell">展开</div>\
    </div>';
    if (targetCate) {
        for (var i = 0; i < diaries.length; i++) {
            var flag = false;
            for (var j = 0; j < targetCate.length; j++) {
                console.log(diaries[i][1][3])
                if (!(targetCate[j] in diaries[i][1][3])) {
                    flag = true;
                };
            };
            if (flag) { continue };
            txt += formatDiary(i);
        }
    }
    else {
        for (var i = 0; i < diaries.length; i++) {
            txt += formatDiary(i);
        }
    };
    mydiary.innerHTML = txt
}

function formatDiary(index) {
    var txt = '\
    <div class="diary" id="d'+ diaries[index][0] + '">\
        <div class="diaryTitle">'+ diaries[index][1][1] + '</div>\
        <div class="diaryDate">'+ diaries[index][1][0] + '</div>\
        <div class="open" onclick="openDiary(\'d'+ diaries[index][0] + '\')">展开</div>\
        <form action="/diary/alterDiary/" method="post" target="frame" name="alterDiary" class="diaryForm" hidden>\
            <input type="text" name="id" value="'+ diaries[index][0] + '" hidden>\
            <input type="text" name="code" class="code" hidden>\
            <input type="text" name="title" value="'+ diaries[index][1][1] + '" placeholder="标题" maxlength="40">\
            <div class="cate">'+ formatSelect(diaries[index][1][3]) + '</div>\
            <input type="date" name="time" value="'+ diaries[index][1][0] + '">\
            <textarea name="content" placeholder="正文">'+ diaries[index][1][2] + '</textarea>\
            <button type="submit" onclick="setCode()">\
                保存\
            </button>\
            <button type="button" onclick="delDiary('+ diaries[index][0] + ')">\
            删除\
            </button>\
        </form>\
    </div>';
    return txt
}

function checkUpdate() {
    setInterval(function () {
        var frame = document.frame;
        if (frame.document.location.href != 'about:blank') {
            console.log(frame.document.location.href);
            frame.document.location.href = 'about:blank';
            var html = frame.document.body.innerHTML;
            if (html == 'success') { fetch() }
            else if (html == 'null error') { alert('标题/日期/标签名不能为空') }
            else if (html == 'account not exist') { alert('用户不存在') }
            else if (html == 'not allowed') { alert('无权限') }
            else if (html == 'existed') { alert('已存在') }
            else { alert('操作失败') };
        }
    }, 100)
}