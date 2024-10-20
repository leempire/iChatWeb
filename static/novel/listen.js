function getShelf() {
    var url, code, data;
    code = localStorage.getItem('code');
    url = '/novel/shelf/';
    data = 'code=' + code;
    post(url, data, function (resp) {
        var books = JSON.parse(resp);
        var txt = '<option value="null" selected>请选择</option>';
        txt += '<option value="' + books[0][0] + '" id="book' + 0 + '" selected>' + books[0][1] + '</option>'
        for (var i = 1; i < books.length; i++) {
            txt += '<option value="' + books[i][0] + '" id="book' + i + '">' + books[i][1] + '</option>'
        }
        document.getElementById('bookName').innerHTML = txt;
        getContent();
    });
}

function getContent() {
    var bookId = getValueById('bookName');
    if (bookId == null) return;
    var url, data;
    url = '/novel/content/';
    data = 'id=' + bookId;
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        var name, con;
        name = resp['name'];
        con = resp['content'];
        var txt = '<option value="null" selected>请选择</option>';
        for (var i = 0; i < con.length; i++) {
            txt += '<option value="' + i + '" id="chapter' + i + '">' + con[i] + '</option>'
        }
        document.getElementById('chapter').innerHTML = txt;

        getProcess(bookId);
    });
}

function getProcess(bookId) {
    var url = '/novel/process/'
    data = 'code=' + localStorage.getItem('code') +
        '&id=' + bookId;
    post(url, data, function (resp) {
        var curChap = document.getElementById('chapter' + parseInt(resp));
        curChap.style.color = '#0097ff';
        curChap.selected = true;
        getText();
    });
}

function getText() {
    ready = false;
    var bookId = getValueById('bookName');
    if (bookId == null) {
        console.log('bookId is null');
        return;
    };
    var chapter = getValueById('chapter');
    if (chapter == null) {
        console.log('chapter is null');
        return;
    };

    var url = '/novel/text/';
    data = 'id=' + bookId + '&chapter=' + parseInt(chapter) + '&code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        var data = JSON.parse(resp);
        var title = data['title'];
        var text = data['text']
        if (title == 'exceed') {
            console.log('exceed');
            return;
        }
        else {
            var txt = title;
            for (var i = 0; i < data['text'].length; i++) {
                txt += text[i] + '\n';
            };
            targetText = txt;
        };
        ready = true;
    });
}

function setSpeakRate(scale) {
    speakRate += scale;
    if (speakRate < 0.1) { speakRate = 0.1 }
    else if (speakRate > 10) { speakRate = 10 };
    document.getElementById('speakRate').innerText = speakRate.toFixed(1);
}

function switchChapter(delta) {
    var chapter = getValueById('chapter');
    if (chapter == null) {
        console.log('chapter is null');
        return;
    };
    chapter = parseInt(chapter);
    chapter += delta;
    if (chapter < 0) {
        console.log('chapter < 0');
        return
    }

    var curChap = document.getElementById('chapter' + parseInt(chapter - delta));
    curChap.style.color = '';

    curChap = document.getElementById('chapter' + parseInt(chapter));
    curChap.style.color = '#0097ff';
    curChap.selected = true;
    getText();
    playUponReady();
}

function play() {
    myCheckFunc();//检查文本框是否为空
    cancel(); //
    to_speak = new SpeechSynthesisUtterance(targetText);

    to_speak.rate = speakRate;// 设置播放语速，范围：0.1 - 10之间

    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for (i = 0; i < voices.length; i++) {
        if (voices[i].name === selectedOption) {
            to_speak.voice = voices[i];
        }
    }

    window.speechSynthesis.speak(to_speak);

}

//暂停
function pause() {
    myCheckFunc();//检查文本框是否为空
    window.speechSynthesis.pause();
}

//继续播放
function resume() {
    myCheckFunc();//检查文本框是否为空
    window.speechSynthesis.resume(); //继续
}

//清除所有语音播报创建的队列
function cancel() {
    window.speechSynthesis.cancel();
}

//检查文本框是否为空
function myCheckFunc() {
    try {
        if (targetText === "")
            throw "文本框为空";

    } catch (error) {
        alert("提示" + error);
    }
}

//创建选择语言的select标签
function populateVoiceList() {

    if (!('speechSynthesis' in window)) {
        throw alert("对不起，您的浏览器不支持")
    }
    to_speak = window.speechSynthesis;
    dataName, voiceSelect = document.querySelector("#voiceSelect");
    voices = [];
    voices = speechSynthesis.getVoices();
    console.log(voices)
    if (voices.length == 0) {
        setTimeout(populateVoiceList, 500);
        return;
    }
    for (i = 0; i < voices.length; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if (voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }
        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
}

function playUponReady() {
    if(ready){
        play();
    }
    else{
        setTimeout(playUponReady, 1000);
    }
}

let targetText = '';
let speakRate = 1;
let ready = false;
var to_speak, dataName, voiceSelect;
addLoadEvent(getShelf);
setTimeout(populateVoiceList, 1000);
