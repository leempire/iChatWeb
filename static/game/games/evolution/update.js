function update(afterLoad = null) {
    var url = '/game/evolution/update/';
    var data = 'code=' + localStorage.getItem('code');
    post(url, data, function (resp) {
        resp = JSON.parse(resp);
        gameData = JSON.parse(resp[0]);
        for (var i = 0; i < resp[1].length; i++) {
            alertInfo(resp[1][i][0], resp[1][i][1]);
        }
        load();
        updateInfoBar();
        if (afterLoad) { afterLoad() };
    })
}

function darkUnlocked() {
    var thunder = gameData['thunder'];
    return (thunder['chaos'] > 40 || thunder['material'] >= 80 || gameData['dark']['explodeNum'] > 0)
}

function wisdomUnlocked() {
    return gt_(gameData['particle'], 3.33e12)
}

function load() {
    setTextByClass('particle', formatNumber(gameData['particle']));
    setTextByClass('thunderNum', formatNumber(gameData['thunder']['num']));
    setTextByClass('dirt', formatNumber(gameData['dirt']));
    if (wisdomUnlocked()) {
        setTextByClass('wisdomNum', formatNumber(gameData['wisdom']['num']));
    }
    else { setTextByClass('wisdomNum', '-') };
    if (darkUnlocked()) {
        setTextByClass('darkNum', formatNumber(gameData['dark']['num']));
    }
    else { setTextByClass('darkNum', '-') };

    if (state == 'items') { setItems(); }
    else if (state == 'thunder') { setThunder(); }
    else if (state == 'dirt') { setDirt(); }
    else if (state == 'wisdom') { setWisdom(); }
    else if (state == 'dark') { setDark(); };
    var items = document.getElementById('items');
    var height = window.innerHeight * 0.98 - items.offsetTop - document.getElementById('msg').scrollHeight;
    items.style.height = height + 'px';
}

function updateInfoBar() {
    if (infoWay == 'itemBuy') {
        var item = gameData['items'][infoNum];
        infoTitle = formatInfoTitle(item['name'], '数量' + formatNumber(item['num']));
        infoPrice = item['price'];
        infoSource = [gameData['particle'], gameData['thunder']['num']];
        infoName = ['粒子', '雷电']
        if (infoNum > 0) {
            infoSource[2] = gameData['items'][infoNum - 1]['num'];
            infoName[2] = gameData['items'][infoNum - 1]['name'];
        };
        numBuy(2 ** (item['copyLevel'] - 1));
    }
    else if (infoWay == 'dirtBuy') {
        var item = gameData['dirtItem'][infoNum];
        infoTitle = formatInfoTitle(item['name'], '数量' + formatNumber(item['num']));
        infoPrice = item['price'];
        infoSource = [gameData['particle'], gameData['thunder']['num']];
        infoName = ['粒子', '雷电'];
        numBuy(2 ** (item['copyLevel'] - 1));
    }
    else if (infoWay == 'itemCopyBuy') {
        var item = gameData['items'][infoNum];
        infoTitle = formatInfoTitle('复制', '等级' + item['copyLevel']);
        infoPrice = item['copyPrice'];
        if (infoPrice == -1) {
            infoHide();
            return;
        };
        infoPrice = [infoPrice];
        infoSource = [gameData['items'][infoNum + 1]['num']];
        infoName = [gameData['items'][infoNum + 1]['name']]
        levelBuy('合成' + item['name'] + '数量×2');
    }
    else if (infoWay == 'itemProduceBuy') {
        var item = gameData['items'][infoNum];
        if (infoNum == 0) { var lastName = '粒子' }
        else { var lastName = gameData['items'][infoNum - 1]['name'] };
        infoTitle = formatInfoTitle('生产', '等级' + item['produceLevel'] + ' 效率' + formatNumber(item['unitSpeed']) + lastName + '/s');
        infoPrice = [item['producePrice']];
        infoSource = [item['num']];
        infoName = [item['name']];
        levelBuy('生产' + lastName + '速度×2');
    }
    else if (infoWay == 'thunderChaosBuy') {
        infoTitle = formatInfoTitle('混沌', '等级' + gameData['thunder']['chaos']);
        infoPrice = [gameData['thunder']['chaosPrice']];
        infoSource = [gameData['particle']];
        infoName = ['粒子'];
        var txt = '雷电生产+1 ';
        if (gameData['thunder']['chaos'] > 40) {
            var gain = gameData['dark']['gain']
            txt += '下一级' + parseInt(gain[0] * 100) + '%获得' + formatNumber(gain[1]) + '暗物质'
        }
        levelBuy(txt);
    }
    else if (infoWay == 'thunderMaterialBuy') {
        infoTitle = formatInfoTitle('物质', '等级' + gameData['thunder']['material']);
        infoPrice = [gameData['thunder']['materialPrice']];
        infoSource = [gameData['dirt']];
        infoName = ['尘埃'];
        var txt = '雷电生产+10% ';
        if (gameData['thunder']['material'] >= 80) {
            var gain = gameData['dark']['gain']
            txt += '下一级' + parseInt(gain[0] * 100) + '%获得' + formatNumber(gain[2]) + '暗物质'
        }
        levelBuy(txt);
    }
    else if (infoWay == 'thunderSecretBuy') {
        infoTitle = formatInfoTitle('奥秘', '等级' + gameData['thunder']['secret']);
        infoPrice = gameData['thunder']['secretPrice'];
        if (infoPrice == -1) {
            infoHide();
            return;
        }
        infoSource = [gameData['particle'], gameData['dirt']];
        infoName = ['粒子', '尘埃'];
        levelBuy('雷电生产提升');
    }
    else if (infoWay == 'thunderStorageBuy') {
        var thunder = gameData['thunder'];
        var percent = div_(thunder['storage'], (add_(thunder['num'], thunder['storage'])));
        infoTitle = formatInfoTitle('蓄电池', '储存雷电' + formatNumber(thunder['storage']) + ' (' + formatNumber(mul_(100, percent)) + '%)');
        infoPrice = [1, 1];
        infoSource = [thunder['num'], thunder['storage']];
        infoName = ['雷电', '蓄电'];
        percentBuy();
    }
    else if (infoWay == 'dirtCopyBuy') {
        var item = gameData['dirtItem'][infoNum];
        infoTitle = formatInfoTitle('复制', '等级' + item['copyLevel']);
        infoPrice = item['copyPrice'];
        infoSource = [gameData['particle'], gameData['thunder']['num']];
        infoName = ['粒子', '雷电'];
        levelBuy('合成' + item['name'] + '×2');
    }
    else if (infoWay == 'dirtProduceBuy') {
        var item = gameData['dirtItem'][infoNum];
        infoTitle = formatInfoTitle(item['name'], ' 效率' + formatNumber(item['unitSpeed'], -2) + '尘埃/s');
        infoPrice = item['producePrice'];
        if (infoPrice == -1) {
            infoHide();
            return;
        }
        infoSource = [item['num'], gameData['particle']];
        infoName = [item['name'], '粒子'];
        levelBuy('大幅增加尘埃生产效率');
    }
    else if (infoWay == 'wisdomBrainBuy') {
        infoTitle = formatInfoTitle('大脑', '等级' + gameData['wisdom']['brainLevel'] + ' 智慧容量+' + 0.5 * gameData['wisdom']['brainLevel'] + '%');
        infoPrice = gameData['wisdom']['brainPrice'];
        infoSource = [gameData['thunder']['num'], gameData['wisdom']['num']];
        infoName = ['雷电', '智慧'];
        numBuy(1);
    }
    else if (infoWay == 'wisdomThinkingBuy') {
        infoTitle = formatInfoTitle('思维', '等级' + gameData['wisdom']['thinking']);
        infoPrice = gameData['wisdom']['thinkingPrice'];
        if (infoPrice == -1) {
            infoHide();
            return;
        }
        infoSource = [gameData['particle'], gameData['thunder']['num'], gameData['wisdom']['num']];
        infoName = ['粒子', '雷电', '智慧'];
        levelBuy('提高智慧生产速度及大脑容量');
    }
    else if (infoWay == 'wisdomNeutralBuy') {
        infoTitle = formatInfoTitle('神经', gameData['wisdom']['neutral']);
        infoPrice = gameData['wisdom']['neutralPrice'];
        infoSource = [gameData['thunder']['num'], gameData['wisdom']['num']];
        infoName = ['雷电', '智慧'];
        numBuy(1);
    }
    else if (infoWay == 'wisdomScienceBuy') {
        var wisdom = gameData['wisdom']
        infoTitle = formatInfoTitle('科学 ' + wisdom['science'], '科技效果+' + wisdom['science'] * 0.06 + '%');
        infoPrice = wisdom['sciencePrice'];
        infoSource = [gameData['thunder']['num'], wisdom['num']];
        infoName = ['雷电', '智慧'];
        numBuy(1);
    }
    else if (infoWay == 'darkAbilityBuy') {
        var item = gameData['dark']['ability'][infoNum];
        var add = '';
        if (infoNum == 0) {
            var names = [
                "原子核",
                "原子",
                "DNA",
                "支原体",
                "蓝藻",
            ];
            for (var i = 0; i < 5; i++) {
                add += names[i] + ': +' + formatNumber(item['add'][i]) + '%<br>'
            };
            add += '······'
        }
        else if (infoNum == 1) {
            add = '雷电: +' + formatNumber(item['add']) + '%'
        }
        else if (infoNum == 2) {
            add = '尘埃: +' + formatNumber(item['add']) + '%'
        }
        else if (infoNum == 3) {
            add = '科技: +' + formatNumber(item['add']) + '%'
        }
        else if (infoNum == 4) {
            add = '智慧生产: +' + formatNumber(item['add'][0]) +
                '%(上限100%)<br>大脑容量: +' + formatNumber(item['add'][1]) +
                '%(上限100%)'
        }
        else if (infoNum == 5) {
            add = '粒子碰撞: +' + formatNumber(item['add'][0]) +
                '%<br>风尘之变: +' + formatNumber(item['add'][1]) +
                '%<br>电闪雷鸣: +' + formatNumber(item['add'][2]) + '%'
        }
        else if (infoNum == 6) {
            add = '复制闪电上限: +' + formatNumber(item['add']) + '%'
        }
        else if (infoNum == 7) {
            add = '时空扭曲: +' + formatNumber(item['add']) + '%'
        }
        else if (infoNum == 8) {
            add = '暗物质发现概率: +' + formatNumber(item['add']) + '%(上限40%)'
        }
        else if (infoNum == 9) {
            add = '获得暗物质数量: +' + formatNumber(item['add']) + '%'
        };
        infoTitle = formatInfoTitle(item['name'], formatNumber(item['state']) + ' ' + item['introduction'] +
            '<div class="hr"></div><div class="speed">' + add + '</div>');
        infoPrice = [1];
        infoSource = [gameData['dark']['energy']];
        infoName = ['暗能量'];
        numBuy(1);
    }
    document.getElementById('infoTitle').innerHTML = infoTitle;
}

function numBuy(k) {
    var value = document.getElementById('infoBar').value / 1000;
    var txt = '';
    var n = mul_(getMax(infoPrice, infoSource), value);
    if (lt_(n, 1)) { n = 1 };
    infoBuyNum = BigNumberToInt(n);
    for (var i = 0; i < infoName.length; i++) {
        txt += formatInfoNeed(mul_(infoPrice[i], infoBuyNum), infoSource[i], infoName[i]);
    }
    setTextById('infoNeed', txt);
    document.getElementById('infoGet').innerText = formatNumber(mul_(n, k));
}

function percentBuy() {
    var thunder = gameData['thunder'];
    var total = add_(thunder['num'], thunder['storage']);
    var value = document.getElementById('infoBar').value / 1000;
    infoBuyNum = mul_(value, total);
    infoBuyNum = BigNumberToInt(infoBuyNum);
    var need, get;
    if (gt_(infoBuyNum, thunder['storage'])) {
        need = formatNumber(sub_(infoBuyNum, thunder['storage'])) + '雷电';
        get = formatNumber(sub_(infoBuyNum, thunder['storage'])) + '蓄电';
    }
    else {
        need = formatNumber(sub_(thunder['storage'], infoBuyNum)) + '蓄电'
        get = formatNumber(sub_(thunder['storage'], infoBuyNum)) + '雷电'
    };
    setTextById('infoNeed', need);
    document.getElementById('infoGet').innerText = get;
}

function levelBuy(toGet) {
    infoBuyNum = 1;
    var txt = '';
    for (var i = 0; i < infoName.length; i++) {
        txt += formatInfoNeed(infoPrice[i], infoSource[i], infoName[i])
    }
    setTextById('infoNeed', txt);
    document.getElementById('infoGet').innerHTML = '<br/>' + toGet;
}

function techBuy(num) {
    var tech = gameData['wisdom']['technology']
    var gain = tech[num]['gain']
    var names = ['雷电', '', '粒子', '尘埃', '雷电'];
    infoWay = 'wisdomTechBuy';
    infoNum = num;
    infoConfirm();
    if (gameData['wisdom']['num'] >= tech[num]['price']) {
        if (num == 1) {
            alertInfo('科技研究', '获得 ' + formatTime(gain));
        }
        else {
            alertInfo('科技研究', '获得 ' + formatNumber(gain) + names[num]);
        }
    }
}

function darkExplode() {
    infoWay = 'darkExplode';
    infoConfirm();
}

function darkAbilityUnlock(num) {
    infoWay = 'darkAbilityUnlock';
    infoNum = num;
    infoConfirm();
}

function infoConfirm() {
    var data = 'code=' + localStorage.getItem('code') +
        '&way=' + infoWay +
        '&num=' + JSON.stringify(infoBuyNum) +
        '&itemNum=' + infoNum;
    var url = '/game/evolution/buy/';
    post(url, data, function (resp) {
        if (resp == 'not exist') { console.log(resp) }
        else if (resp == 'not enough') { console.log(resp) }
        else {
            resp = JSON.parse(resp);
            gameData = resp;
            load();
            updateInfoBar();
        };
    });
}

function autoBuySwitch() {
    var data = 'code=' + localStorage.getItem('code');
    var url = '/game/evolution/autoBuy/';
    post(url, data, function(resp){});
}

var gameData;
var state = 'items';
var infoName, infoSource, infoPrice, infoWay, infoNum, infoTitle, infoBuyNum;
setInterval(update, 1000);
onload = function () {
    update(function () { initItems(); load(); });
};