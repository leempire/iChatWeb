function getVideo() {
    let id = getPar('id');
    let data = 'id=' + id + '&code=' + localStorage.getItem('code');
    let url = '/ted/video/';
    post(url, data, function (resp) {
        console.log(resp)
        let frame = document.getElementById('iframe');
        frame.src = resp;
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

checkLogged();
addLoadEvent(adjust);
addLoadEvent(getVideo);
addLoadEvent(getVideosNotWatched);
