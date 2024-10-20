function fetch() {
    var url = '/cloud/fetch/';
    var data = 'code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        var txt = '';
        for (var i = 0; i < resp.length; i++) {
            txt += formatFileItem(i + 1, resp[i]);
        }
        document.getElementById('files').innerHTML = txt;
    });
};

function afterSubmit() {
    fetch();
    scrollToBottom();
    document.getElementById('file').value = null;
}

function scrollToBottom() {
    var files = document.getElementById('files')
    files.scrollTop = files.scrollHeight;
};

function formatFileItem(id, item) {
    return '<div class="line">' +
        '<div class="id cell">' + id + '</div>' +
        '<div class="filename cell">' + item[1] + '</div>' +
        '<div class="operation cell">' +
        '<button onclick="get(\'' + item[2] + '\')">预览</button>' +
        '<button onclick="download(\'' +
        item[2] + '\',\'' + item[1] +
        '\')">下载</button>' +
        '<button onclick="del(\'' + item[2] + '\')">删除</button>' +
        '<button onclick="share(\'' + item[2] + '\')">分享</button>' +
        '</div>' +
        '</div>';
};

function get(location) {
    var url = '/static/cloud/data/' + location;
    window.open(url);
};

function del(location) {
    var url = '/cloud/delete/';
    var data = 'location=' + location;
    post(url, data, function (resp) {
        if (resp != 'success') { alert('删除失败') }
        else { fetch() }
    })
};

function share(location) {
    var url = 'http://herbivory.cn:55556/static/cloud/data/' + location;
    copyText(url);
}
//复制文本
function copyText(text) {
    var element = createElement(text);
    element.select();
    element.setSelectionRange(0, element.value.length);
    document.execCommand('copy');
    element.remove();
    alert("分享链接已复制到剪切板");
}

//创建临时的输入框元素
function createElement(text) {
    var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    var element = document.createElement('textarea');
    // 防止在ios中产生缩放效果
    element.style.fontSize = '12pt';
    // 重置盒模型
    element.style.border = '0';
    element.style.padding = '0';
    element.style.margin = '0';
    // 将元素移到屏幕外
    element.style.position = 'absolute';
    element.style[isRTL ? 'right' : 'left'] = '-9999px';
    // 移动元素到页面底部
    let yPosition = window.pageYOffset || document.documentElement.scrollTop;
    element.style.top = `${yPosition}px`;
    //设置元素只读
    element.setAttribute('readonly', '');
    element.value = text;
    document.body.appendChild(element);
    return element;
}

function upload() {
    if (!document.getElementById('file').files.length) {
        alert('请选择文件');
        return
    };
    // if (document.getElementById('file').files[0].size > 16 * 1024 * 1024) {
    //     alert('普通用户上传文件大小不能超过16Mb');
    //     return
    // };
    document.getElementById('code').value = localStorage.getItem('code');
    document.getElementById('form').submit();
}

function download(location, fileName) {
    setTimeout(function () { alert('正在下载文件"' + fileName + '"，请稍候...') }, 100);
    var url = '/static/cloud/data/' + location;
    const url2 = url.replace(/\\/g, '/');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url2, true);
    xhr.responseType = 'blob';
    //xhr.setRequestHeader('Authorization', 'Basic a2VybWl0Omtlcm1pdA==');
    // 为了避免大文件影响用户体验，建议加loading
    xhr.onload = () => {
        if (xhr.status === 200) {
            // 获取文件blob数据并保存
            saveAs(xhr.response, fileName);
        }
    };
    xhr.send();
}

function saveAs(data, name) {
    const urlObject = window.URL || window.webkitURL || window;
    const export_blob = new Blob([data]);
    //createElementNS() 方法可创建带有指定命名空间的元素节点。
    //此方法可返回一个 Element 对象。
    const save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    save_link.click();
}

function jumpNew() {
    let name = document.getElementById('account').value;
    if (!name) { document.location.href = 'http://herbivory.cn:55558/ichat/共享/' }
    else { document.location.href = 'http://herbivory.cn:55558/ichat/home/' + name + '/' };
}
