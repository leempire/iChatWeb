function checkForm() {
    var setting = {};
    var item;
    var items = [
        'color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
        'autoReadOption', 'autoScrollOption'
    ];
    for (var i = 0; i < items.length; i++) {
        item = items[i];
        setting[item] = getValueById(item)
    };

    localStorage.setItem('novelStyle', JSON.stringify(setting));
    setStyle();
}

function setDefault() {
    var setting = JSON.parse(localStorage.getItem('novelStyle'));
    for (var k in setting) {
        var element = document.getElementById(k);
        if (element == null) { localStorage.removeItem(k); continue };
        element.value = setting[k];
    }
}

function fontFamilyInfo() {
    if (fontFamilyInfoShowed) { return }
    fontFamilyInfoShowed = true;
    setTimeout(function () {
        alert('首次加载字体需等待30秒左右，期间请勿刷新页面');
    }, 100)
}

var fontFamilyInfoShowed = false;
checkLogged();
setTimeout(setDefault, 100);
addLoadEvent(setDefault);