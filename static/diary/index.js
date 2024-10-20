function openDiary(id) {
    var diary = document.getElementById(id);
    if (diary.children[3].hidden) {
        diary.children[2].innerHTML = '收起';
        diary.children[3].hidden = false;
        diary.style.height = 'auto';
    }
    else {
        diary.children[2].innerHTML = '展开';
        diary.children[3].hidden = true;
        diary.style.height = '2em';
    };
}

function moreOperation() {
    var o1 = document.getElementById('o1');
    if (o1.style.display == 'block') {
        o1.style.display = 'none'
    }
    else {
        o1.style.display = 'block'
    }
}


checkLogged();
setTimeout(function () {
    fetch();
    checkUpdate();
}, 100)
