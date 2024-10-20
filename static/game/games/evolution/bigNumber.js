function toBigNumber(n, dp = 0) {
    if (typeof (n) == 'number') {
        n = n.toString()
    }
    if (typeof (n) == 'string') {
        var power = BaseOfBigNumber - 1 + dp;
        var index = n.indexOf('e');
        if (index != -1) {
            power += parseInt(n.slice(index + 1));
            n = n.slice(0, index);
        }
        index = n.indexOf('.');
        if (index != -1) {
            power -= n.slice(index + 1).length;
            n = n.replace('.', '')
        }
        while (n.length > 1 && n.slice(0, 1) == '0') {
            n = n.slice(1);
        }
        while (n.length > 1 && n.slice(n.length - 1) == '0') {
            n = n.slice(0, n.length - 1);
            power += 1
        }
        power += n.length - BaseOfBigNumber
        n = n.slice(0, BaseOfBigNumber)
        if (n == '0') { power = 0 }
        n = { '__class__': 'BigNumber', 'value': [n, power] }
        return n;
    }
    if (n['__class__'] == 'BigNumber') { return n }
}

function BigNumberToStr(num, n) {
    var a, p;
    [a, p] = num['value'];
    if (a == '0') { return '0' };
    if (p < n) { return '0' };
    if (p > 4) {
        if (a.length > 1) {
            a = a.slice(0, 1) + '.' + a.slice(1, 3);
        }
        return a + 'e' + p;
    }
    a = BigNumberToFloat(num);
    return formatNumber(a, n)
}

function getExactNP(n) {
    n = toBigNumber(n);
    return n['value'];
}

function BigNumberToFloat(n) {
    var n1, p1;
    [n1, p1] = getExactNP(n);
    if (n1 == '0') { return 0.0 }
    if (p1 < 0) {
        n1 = '0.' + stringCopy('0', -p1 - 1) + n1;
        return parseFloat(n1)
    }
    if (p1 < n1.length - 1) {
        n1 = n1.slice(0, p1 + 1) + '.' + n1.slice(p1 + 1)
        return parseFloat(n1)
    }
    n1 += stringCopy('0', p1 - n1.length + 1);
    return parseFloat(n1);
}

function add_(a, b) {
    b = toBigNumber(b);
    a = toBigNumber(a);
    var n1, p1, n2, p2;
    [n1, p1] = getExactNP(a);
    [n2, p2] = getExactNP(b);
    if (p1 < p2) { return add_(b, a) };
    if (p1 - p2 > BaseOfBigNumber) { return a };
    var dd = p2 - BaseOfBigNumber + 1;
    n1 += stringCopy('0', BaseOfBigNumber - n1.length + p1 - p2);
    n2 += stringCopy('0', BaseOfBigNumber - n2.length);
    return toBigNumber(BigNumberToFloat(n1) + BigNumberToFloat(n2), dd)
}

function sub_(a, b) {
    b = toBigNumber(b);
    a = toBigNumber(a);
    var n1, p1, n2, p2;
    [n1, p1] = getExactNP(a);
    [n2, p2] = getExactNP(b);
    if (p1 - p2 > BaseOfBigNumber) { return a };
    var dd = p2 - BaseOfBigNumber + 1;
    n1 += stringCopy('0', BaseOfBigNumber - n1.length + p1 - p2);
    n2 += stringCopy('0', BaseOfBigNumber - n2.length);
    return toBigNumber(BigNumberToFloat(n1) - BigNumberToFloat(n2), dd)
}

function mul_(a, b) {
    b = toBigNumber(b);
    a = toBigNumber(a);
    var n1, p1, n2, p2;
    [n1, p1] = getExactNP(a);
    [n2, p2] = getExactNP(b);
    var dd = n1.length + n2.length - 2 - p1 - p2;
    n1 = toBigNumber(parseInt(n1) * parseInt(n2), -dd);
    return n1;
}

function div_(a, b) {
    b = toBigNumber(b);
    a = toBigNumber(a);
    var n1, p1, n2, p2;
    [n1, p1] = getExactNP(a);
    [n2, p2] = getExactNP(b);
    var dd = n1.length - p1 - n2.length + p2;
    n1 = toBigNumber(parseInt(n1) / parseInt(n2), -dd);
    return n1;
}

function gt_(a, b) {
    b = toBigNumber(b);
    a = toBigNumber(a);
    var n1, p1, n2, p2;
    [n1, p1] = a['value'];
    [n2, p2] = b['value'];
    if (p1 > p2) { return true }
    if (p1 < p2) { return false }
    n1 += stringCopy('0', BaseOfBigNumber - n1.length);
    n2 += stringCopy('0', BaseOfBigNumber - n2.length);
    if (parseInt(n1) > parseInt(n2)) { return true }
    return false
}

function lt_(a, b) {
    return gt_(b, a)
}


function stringCopy(str, num) {
    var target = '';
    for (var i = 0; i < num; i++) {
        target += str;
    }
    return target
}


function BigNumberToInt(num) {
    var n, p;
    [n, p] = getExactNP(num);
    if (p < 0) { return toBigNumber(0) };
    n = n.slice(0, p + 1);
    n += stringCopy('0', p + 1 - n.length)
    return toBigNumber(n);
}


var BaseOfBigNumber = 32;
