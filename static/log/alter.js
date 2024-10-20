function alter() {
    var account, password, new_password, data, url;
    url = '/log/alter/';
    account = getValueById('account');
    password = getValueById('password');
    new_password = getValueById('new_password');
    if (!account) { alert('请输入账号'); return; };
    if (!password) { alert('请输入密码'); return; };
    if (!new_password) { alert('密码不能为空！'); return; };
    data = 'account=' + account +
        '&password=' + password +
        '&new_password=' + new_password;
    post(url, data, function (resp) {
        if (resp == 'account not exist') { alert('账号不存在'); }
        else if (resp == 'password wrong') { alert('密码错误'); }
        else if (resp == 'success') {
            alert('修改成功');
            switchTo('./index.html');
        }
    });
};