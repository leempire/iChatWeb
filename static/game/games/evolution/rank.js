function getRank() {
    var data = 'code=' + localStorage.getItem('code');
    var url = '/game/evolution/rank/';
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        showRank(resp);
    })
}

function formatNumber(num, n = 0) {
    if (num['__class__'] == 'BigNumber') {
        return BigNumberToStr(num, n)
    }
    if (num > 99999) {
        num = Math.floor(num);
        num = shortNumber(num);
    }
    else {
        num = Math.floor(num * 10 ** (-n)) / 10 ** (-n);
    };
    return num;
}

const shortNumber = (num) => {
    if (num !== 0) {
        var p = Math.floor(Math.log10(num));
        var n = num * (10 ** -p);
        n = n.toString().slice(0, 4)
        return `${n}e${p}`;
    }
    return 0
};

function showRank(ranks) {
    var txt = '';
    var rank;
    for (var i = 0; i < ranks.length; i++) {
        rank = ranks[i]
        txt += '<div class="item">\
            <span class="title inline">'+ (i + 1) + ' ' + rank[0] + '</span>\
            <span class="speed inline">'+ rank[1] + ' ' + formatNumber(rank[2]) + '</span>\
        </div>';
    };
    document.getElementById('items').innerHTML = txt;
}

getRank();