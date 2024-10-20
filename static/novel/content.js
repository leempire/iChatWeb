function getContent() {
    var id = getPar('id');
    var url, data;
    url = '/novel/content/';
    data = 'id=' + id;
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        var name, con;
        name = resp['name'];
        con = resp['content'];
        document.getElementById('title').innerHTML = name + '<button onclick="download(' + localStorage.getItem('code') + ', ' + id + ')">下载</button>';
        var txt = '';
        for (var i = 0; i < con.length; i++) {
            txt +=
                '<div class="chapter hover" id="c' + i +
                '" onclick="switchChapter(' + i +
                ')">' + con[i] + '</div>';
        };
        document.getElementById('content').innerHTML = txt;
        getProcess();
    });
};

function getProcess() {
    var url = '/novel/process/'
    data = 'code=' + localStorage.getItem('code') +
        '&id=' + getPar('id');
    post(url, data, function (resp) {
        var target = document.getElementById('c' + parseInt(resp));
        var delta = document.getElementById('content').offsetTop;
        target.style.color = '#0097ff';
        document.getElementById('content').scrollTo({
            top: target.offsetTop - delta,
            behavior: 'smooth'
        })
    });
}

function switchChapter(chapter) {
    document.location.href = './reader.html?id=' + getPar('id') +
        '&chapter=' + chapter;
};

function download(code, id) {
    var url = '/novel/download/';
    var data = 'code=' + code + '&id=' + id;
    console.log(data)
    post(url, data, function(resp){
        if(resp=='success'){alert('下载成功，请前往云盘查看')}
        else{alert('出现错误')}
    });
}

checkLogged();
getContent();