function setStyle() {
    var setting = localStorage.getItem('novelStyle');
    if (setting == null) { return };
    setting = JSON.parse(setting);

    colorScheme(setting['color']);
    fontFamily(setting['fontFamily']);
    fontSize(setting['fontSize']);
    fontWeight(setting['fontWeight']);
    lineHeight(setting['lineHeight']);
    autoReadOption_(setting['autoReadOption']);
    autoScrollOption_(setting['autoScrollOption']);
}

function colorScheme(scheme) {
    if (scheme == null) { return };
    var link = document.createElement('link');
    link.href = './colorScheme/' + scheme + '.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.id = 'colorScheme';
    document.head.insertAdjacentElement('beforeend', link);
}

function fontFamily(family) {
    if (family == null) { return };
    var txt;
    if (family == 'default') {
        txt = 'body{font-family: none}'
    }
    else {
        var url = './font/' + family;
        txt = '\
    @font-face {\
        font-family: ziti;\
        src: url('+ url + ');\
    }\
    body {\
        font-family: ziti;\
    }'};
    var fontStyle = document.createElement('style');
    fontStyle.innerHTML = txt;
    document.head.insertAdjacentElement('beforeend', fontStyle)
}

function fontSize(size) {
    if (size == null) { return };
    document.body.style.fontSize = size;
}

function fontWeight(weight) {
    if (weight == null) { return };
    var line = document.createElement('style');
    line.innerHTML = 'body{font-weight:' + weight + ';}'
    document.head.insertAdjacentElement('beforeend', line)
}

function lineHeight(height) {
    if (height == null) { return };
    var line = document.createElement('style');
    line.innerHTML = '.line{line-height: ' + height + '}'
    document.head.insertAdjacentElement('beforeend', line)
}

function autoReadOption_(option) {
    if (option == 'false') { autoReadOption = false }
    else if (option == null) { autoReadOption = false }
    else { autoReadOption = true };
}

function autoScrollOption_(option) {
    if (option == '1') { autoScrollOption = 1 }
    else if (option == '2') { autoScrollOption = 2 }
    else { autoScrollOption = 1 };
}

function smoothScroll(height) {
    window.scrollBy({
        top: height,
        behavior: 'smooth',
        duration: 1000
    });
}

var autoReadOption;
var autoScrollOption;
addLoadEvent(setStyle);