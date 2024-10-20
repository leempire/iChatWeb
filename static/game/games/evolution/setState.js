function switchState(target) {
    infoHide();
    if (target == 'dark' && !darkUnlocked()) {
        alertInfo('未解锁', '混沌>40或物质≥80解锁');
        return;
    }
    if (target == 'wisdom' && !wisdomUnlocked()) {
        alertInfo('未解锁', '粒子≥3.33e12解锁');
        return;
    }
    state = target;
    if (target == 'items') { initItems() }
    else if (target == 'thunder') { initThunder() }
    else if (target == 'dirt') { initDirt() }
    else if (target == 'wisdom') { initWisdom() }
    else if (target == 'dark') { initDark() };
    load();
    var infos = document.getElementsByClassName('tmpInfo');
    for (var i = infos.length - 1; i >= 0; i--) {
        infos[i].remove();
        console.log(infos)
    }
}

function initItems() {
    var items = gameData['items'];
    var item, lastName;
    var txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/particle.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">粒子</div>\
        <div class="speed">数量 <span class="particle"></span></div>\
        <div class="speed">生产 +<span class="itemSpeed0"></span>/s</div>\
    </div>\
    </div>';
    setTextById('msg', txt);
    txt = '';
    for (var i = items.length - 1; i >= 0; i--) {
        item = items[i]
        if (i > 0) { lastName = items[i - 1]['name'] }
        else { lastName = '粒子' };

        txt += '<div class="item itemImg itemItem">\
            <div class="img">\
                <img src="./source/item'+ i + '.png" alt="">\
            </div>\
            <div class="data">\
                <div class="title">'+ item['name'] + ' <span class="itemNum' + i + '"></span></div>\
                <div class="speed">生产'+ lastName + ' <span class="itemSpeed' + i + '"></span>/s</div>\
                <button onclick="showInfo(\'itemBuy\',' + i + ')">合成</button>\
                <button id="copyBuy' + i + '">未解锁</button>\
                <button onclick="showInfo(\'itemProduceBuy\',' + i + ')" id="itemProduce' + i + '">生产</button>\
            </div>\
        </div>';
    };
    setTextById('items', txt);
}

function initThunder() {
    var thunder = gameData['thunder'];
    var txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/thunder.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">雷电</div>\
        <div class="speed">数量 <span class="thunderNum"></span></div>\
        <div class="speed">生产 +<span class="thunderSpeed"></span>/s</div>\
    </div>\
</div>'
    setTextById('msg', txt);
    txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/chaos.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">混沌</div>\
        <div class="speed">生产 +<span class="thunderChaosSpeed"></span>/s</div>\
        <button onclick="showInfo(\'thunderChaosBuy\',1)" id="thunderChaosBuy">升级</button>\
    </div>\
</div>\
<div class="item itemImg">\
    <div class="img">\
        <img src="./source/material.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">物质</div>\
        <div class="speed">生产 +<span class="thunderMaterialSpeed"></span>%</div>\
        <button onclick="showInfo(\'thunderMaterialBuy\', 1)" id="thunderMaterialBuy">升级</button>\
    </div>\
</div>\
<div class="item itemImg">\
    <div class="img">\
        <img src="./source/secret.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">奥秘</div>\
        <div class="speed">生产 +<span class="thunderSecretSpeed"></span>%</div>';
    if (thunder['secret'] < 5) {
        txt += '<button onclick="showInfo(\'thunderSecretBuy\', 1)" id="thunderSecretBuy">升级';
    }
    else {
        txt += '<button onclick="" id="thunderSecretBuy">已满级';
    };
    txt += '</button></div></div>'

    if (gameData['wisdom']['thinking'] < 4) { var storageUnlock = '">思维极限解锁' }
    else { var storageUnlock = 'showInfo(\'thunderStorageBuy\')">转换' };
    txt += '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/storage.png" alt="">\
    </div>\
    <div class="data">\
    <div class="title">蓄电池</div>\
    <div class="speed">蓄电 <span class="thunderStorageNum"></span></div>\
    <button onclick="'+ storageUnlock +
        '</button>\
</div></div>'
    txt += '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/storage.png" alt="">\
    </div>\
    <div class="data">\
    <div class="title">自动升级</div>\
    <div class="speed">自动升级 <span class="autoBuy"></span></div>\
    <button onclick="autoBuySwitch()">切换</button>\
</div></div>'
    setTextById('items', txt);
}

function initDirt() {
    var items = gameData['dirtItem'];
    var item;
    var txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/dirt.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">尘埃</div>\
        <div class="speed">数量 <span class="dirt"></span></div>\
        <div class="speed">生产 +<span class="dirtSpeed"></span>/s</div>\
</div></div>';
    setTextById('msg', txt);
    txt = '';
    for (var i = items.length - 1; i >= 0; i--) {
        item = items[i];
        txt += '<div class="item itemImg dirtItem">\
        <div class="img">\
            <img src="./source/dirt'+ i + '.png" alt="">\
        </div>\
        <div class="data">\
            <div class="title"><span class="dirtItemName' + i + '"></span> <span class="dirtItemNum' + i + '"></span></div>\
            <div class="speed">生产尘埃 <span class="dirtItemSpeed'+ i + '"></span>/s</div>\
            <button onclick="showInfo(\'dirtBuy\',' + i + ')">合成</button>\
            <button onclick="showInfo(\'dirtCopyBuy\',' + i + ')">复制</button>\
            <button onclick="'
        if (item['producePrice'] == -1) {
            txt += '" id="dirtItemProduce' + i + '">已满级</button></div></div>'
        }
        else {
            txt += 'showInfo(\'dirtProduceBuy\',' + i + ')" id="dirtItemProduce' + i + '">精炼</button></div></div>';
        }
    };
    setTextById('items', txt);
}

function initWisdom() {
    var wisdom = gameData['wisdom'];
    var txt = '<div class="item itemImg">\
        <div class="img">\
            <img src="./source/brain.png" alt="">\
        </div>\
    <div class="data">\
        <div class="title">智慧</div>\
        <div class="speed">数量 <span class="wisdomNum"></span></div>\
        <div class="speed">生产 +<span class="wisdomSpeed"></span>/s</div>\
</div></div>';
    setTextById('msg', txt);
    var thinkingLevel;
    if (wisdom['thinking'] >= 4) { thinkingLevel = '">已满级' }
    else { thinkingLevel = 'showInfo(\'wisdomThinkingBuy\',1)">升级' };
    txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/brain.png" alt="">\
    </div>\
    <div class="data">\
        <div class="title">大脑 等级<span class="wisdomBrainLevel"></span></div>\
        <div class="speed">智慧 <span class="wisdomNum"></span> / <span class="wisdomMaxContain"></span></div>\
        <button onclick="showInfo(\'wisdomBrainBuy\',1)">合成</button>\
    </div></div>\
    <div class="item itemImg">\
    <div class="img">\
        <img src="./source/thinking.png" alt="">\
    </div>\
<div class="data">\
    <div class="title">思维 等级<span class="wisdomThinkingLevel"></span></div>\
    <div class="speed">智慧生产 <span class="wisdomSpeed"></span>/s</div>\
    <button id="wisdomThinkingBuy" onclick="'+ thinkingLevel + '</button>\
</div></div>\
<div class="item itemImg">\
<div class="img">\
    <img src="./source/neutral.png" alt="">\
</div>\
<div class="data">\
    <div class="title">神经 数量<span class="wisdomNeutralNum"></span></div>\
    <div class="speed">思维效率+<span class="wisdomNeutralSpeed"></span>%</div>\
    <button id="wisdomNeutralBuy" onclick="';

    if (gameData['wisdom']['thinking'] >= 3) { txt += 'showInfo(\'wisdomNeutralBuy\',1)">合成</button></div>'; }
    else { txt += '">思维3级解锁</button></div>' };

    txt += '</div><div class="item itemImg">\
    <div class="img">\
        <img src="./source/science.png" alt="">\
    </div>\
<div class="data">\
    <div class="title">科学 等级<span class="wisdomScienceLevel"></span></div>\
    <div class="speed">科技效果+<span class="wisdomScienceSpeed"></span>%</div>\
    <button id="wisdomScienceBuy" onclick="'

    if (gameData['wisdom']['thinking'] >= 4) { txt += 'showInfo(\'wisdomScienceBuy\',1)">合成</button></div>'; }
    else { txt += '">思维极限解锁</button></div>' };

    var tech = wisdom['technology'];
    var names = ['雷电', '', '粒子', '尘埃', '雷电'];
    for (var i = 0; i < tech.length; i++) {
        txt += '</div><div class="item itemImg">\
        <div class="img">\
            <img src="./source/tech'+ i + '.png" alt="">\
        </div>\
    <div class="data">' +
            '<div class="title">科技 ' + tech[i]['name'] + '</div>' +
            '<div class="speed">需要 <span class="wisdomTechNeed' + i + '"></span></div>' +
            '<div class="speed">获得 <span class="wisdomTechGain' + i + '"></span>' + names[i] + '</div>' +
            '<button onclick="techBuy(' + i + ')">研究</button>' +
            '</div></div>'
    }
    setTextById('items', txt);
}

function initDark() {
    var dark = gameData['dark'];
    var txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/dark.png" alt="">\
    </div>\
<div class="data">\
    <div class="title">暗物质</div>\
    <div class="speed"> <span class="darkNum"></span></div>\
</div></div>';
    setTextById('msg', txt);
    txt = '<div class="item itemImg">\
    <div class="img">\
        <img src="./source/explode.png" alt="">\
    </div>\
<div class="data">\
<div class="title">宇宙大爆炸</div>\
<div class="speed">需要 <span class="darkExplodePrice"></span></div>\
<div class="speed">（在其他地方消耗将减少爆炸需要）</div>\
<div class="speed">获得 <span class="darkExplodeGain"></span>暗能量</div>\
<button onclick="darkExplode()">引爆</button>\
</div></div>'+
        '<div class="item itemImg">\
        <div class="img">\
            <img src="./source/darkEnergy.png" alt="">\
        </div>\
    <div class="data">\
    <div class="title">暗能量</div>\
    <div class="speed">数量 <span class="darkEnergy"></span></div>\
    <div class="speed">生产雷电 +<span class="darkThunderSpeed"></span>/s</div>\
</div></div>';
    var ability = dark['ability'];
    for (var i = 0; i < ability.length; i++) {
        var numState;
        if (ability[i]['state'] == -1) {
            numState = 'darkAbilityUnlock(' + i + ')">解锁'
        }
        else {
            numState = 'showInfo("darkAbilityBuy", ' + i + ')">升级'
        }
        txt += '<div class="item itemImg">\
        <div class="img">\
            <img src="./source/dark'+ i + '.png" alt="">\
        </div>\
    <div class="data">\
        <div class="title">暗能力 '+ ability[i]['name'] + '</div>\
        <div class="speed"><span class="darkAbilityInfo'+ i + '"></span> <span class="darkAbilityPrice' + i + '"></span></div>\
        <div class="speed">'+ ability[i]['introduction'] + '</div>\
        <button id="darkAbilityBuy'+ i + '" onclick="' + numState + '</button>\
        </div></div>';
    };
    setTextById('items', txt);
}

function setItems() {
    var items = gameData['items'];
    if (items.length != document.getElementsByClassName('itemItem').length) {
        initItems();
    };
    for (var i = 0; i < items.length; i++) {
        setTextByClass('itemNum' + i, formatNumber(items[i]['num']));
        setTextByClass('itemSpeed' + i, formatNumber(mul_(items[i]['unitSpeed'], items[i]['num'])));
        if (lt_(items[i]['producePrice'], items[i]['num'])) {
            setBorderColorById('itemProduce' + i, 'rgb(28,203,208)')
        }
        else { setBorderColorById('itemProduce' + i, 'rgba(0,0,0,0)') }
        if (i + 1 < items.length) {
            var button = document.getElementById('copyBuy' + i);
            if (button.innerText == '未解锁') {
                button.innerText = '复制';
                let j = i;
                button.onclick = function () { showInfo('itemCopyBuy', j) };
            }
        }
    }
}

function setThunder() {
    var thunder = gameData['thunder'];
    setTextByClass('thunderSpeed', formatNumber(thunder['speed']));
    setTextByClass('thunderChaosSpeed', formatNumber(thunder['chaos'] - 1));
    setTextByClass('thunderMaterialSpeed', formatNumber(Math.floor((1.1 ** (thunder['material'] - 1) - 1) * 100)));
    if (gt_(gameData['particle'], thunder['chaosPrice'])) { setBorderColorById('thunderChaosBuy', 'rgb(28,203,208)') }
    else { setBorderColorById('thunderChaosBuy', 'rgba(0,0,0,0)') };
    if (gt_(gameData['dirt'], thunder['materialPrice'])) { setBorderColorById('thunderMaterialBuy', 'rgb(28,203,208)') }
    else { setBorderColorById('thunderMaterialBuy', 'rgba(0,0,0,0)') };
    setTextByClass('thunderSecretSpeed', formatNumber(thunder['secret'] * (thunder['chaos'] + 20)));
    var secretButton = document.getElementById('thunderSecretBuy');
    if (thunder['secret'] == 5 && secretButton.innerText != '已满级') {
        secretButton.innerText = '已满级';
        secretButton.onclick = null;
    };
    setTextByClass('thunderStorageNum', formatNumber(thunder['storage']));
    if (gameData['autoBuy']) {
        setTextByClass('autoBuy', '开');
    }
    else {
        setTextByClass('autoBuy', '关');
    };
}

function setDirt() {
    var items = gameData['dirtItem'];
    if (items.length != document.getElementsByClassName('dirtItem').length) {
        initDirt();
    };
    var item;
    setTextByClass('dirtSpeed', formatNumber(gameData['dirtSpeed'], -2))
    for (var i = items.length - 1; i >= 0; i--) {
        item = items[i];
        setTextByClass('dirtItemName' + i, item['name']);
        setTextByClass('dirtItemNum' + i, formatNumber(item['num']));
        setTextByClass('dirtItemSpeed' + i, formatNumber(mul_(item['unitSpeed'], item['num']), -2));
        if (item['producePrice'] != -1) {
            if (gt_(gameData['particle'], item['producePrice'][1])) { setBorderColorById('dirtItemProduce' + i, 'rgb(28,203,208)') }
            else { setBorderColorById('dirtItemProduce' + i, 'rgba(0,0,0,0)') };
        }
    };
}

function setWisdom() {
    var wisdom = gameData['wisdom'];
    setTextByClass('wisdomSpeed', formatNumber(wisdom['speed'], -2));
    setTextByClass('wisdomBrainLevel', wisdom['brainLevel'])
    setTextByClass('wisdomMaxContain', formatNumber(wisdom['maxContain']));
    setTextByClass('wisdomThinkingLevel', wisdom['thinking']);
    setTextByClass('wisdomNeutralNum', wisdom['neutral']);
    setTextByClass('wisdomNeutralSpeed', formatNumber(wisdom['neutralSpeed'], -3));
    setTextByClass('wisdomScienceSpeed', formatNumber(mul_(wisdom['scienceAdd'], 100)));
    setTextByClass('wisdomScienceLevel', wisdom['science']);
    var tech = wisdom['technology'];
    for (var i = 0; i < tech.length; i++) {
        setTextByClass('wisdomTechNeed' + i, formatInfoNeed([tech[i]['price']], [wisdom['num']], '智慧'));
        if (i == 1) {
            setTextByClass('wisdomTechGain' + i, formatTime(BigNumberToFloat(tech[i]['gain'])));
        }
        else {
            setTextByClass('wisdomTechGain' + i, formatNumber(tech[i]['gain']));
        }
    };
    var button = document.getElementById('wisdomThinkingBuy');
    if (wisdom['thinking'] >= 4 && button.innerText != '已满级') {
        button.innerText = '已满级';
        button.onclick = null;
    };
    var button = document.getElementById('wisdomNeutralBuy');
    if (wisdom['thinking'] >= 3 && button.innerText != '合成') {
        button.innerText = '合成';
        button.onclick = function () { showInfo('wisdomNeutralBuy', 1) };
    };
    var button = document.getElementById('wisdomScienceBuy');
    if (wisdom['thinking'] >= 4 && button.innerText != '合成') {
        button.innerText = '合成';
        button.onclick = function () { showInfo('wisdomScienceBuy', 1) };
    };
}

function setDark() {
    var dark = gameData['dark'];
    var ability = dark['ability'];
    setTextByClass('darkExplodePrice', formatInfoNeed(dark['explodePrice'], gameData['wisdom']['num'], '智慧'));
    setTextByClass('darkExplodeGain', formatNumber(dark['num']));
    setTextByClass('darkEnergy', formatNumber(dark['energy']));
    setTextByClass('darkThunderSpeed', formatNumber(div_(dark['energy'], 10)));
    for (var i = 0; i < ability.length; i++) {
        let j = i;
        var button = document.getElementById('darkAbilityBuy' + i);
        if (ability[i]['state'] == -1) {
            setTextByClass('darkAbilityInfo' + i, '需要');
            button.innerText = '解锁';
            button.onclick = function () { darkAbilityUnlock(j) };
        }
        else {
            setTextByClass('darkAbilityInfo' + i, '数量');
            button.innerText = '升级';
            button.onclick = function () { showInfo('darkAbilityBuy', j) };
        };
        if (ability[i]['state'] == -1) {
            setTextByClass('darkAbilityPrice' + i, formatInfoNeed(ability[i]['price'], dark['energy'], '暗能量'));
        }
        else { setTextByClass('darkAbilityPrice' + i, formatNumber(ability[i]['state'])) }
    };
}