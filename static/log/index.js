function login() {
    var url, data, account, password;
    url = '/log/login/';
    account = document.getElementById('account').value;
    password = document.getElementById('password').value;
    data = 'account=' + account + '&password=' + password;
    if (!account) { alert('请输入账号'); return; };
    if (!password) { alert('请输入密码'); return; };
    post(url, data, function (resp) {
        if (resp == 'account not exist') { alert('账号不存在'); }
        else if (resp == 'password wrong') { alert('账号或密码错误'); }
        else {
            localStorage.setItem('code', resp)
            alert('登录成功');
            let from = getPar('from');
            if (from) { switchTo(from); }
            else { switchTo('../index.html'); };
        }
    })
}