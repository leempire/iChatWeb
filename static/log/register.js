function register() {
    var url, data, account, password, confirm, email, code;
    url = '/log/register/';
    account = getValueById('account');
    password = getValueById('password');
    confirm = getValueById('confirm');
    email = getValueById('email');
    code = getValueById('code');
    if (!account) { alert('账号不能为空'); return; };
    if (!password) { alert('密码不能为空'); return; };
    if (confirm != password) { alert('两次密码输入不一致'); return; };
    if (!email) { alert('请输入邮箱'); return; };
    if (!code) { alert('请输入验证码'); return; };
    data = 'account=' + account +
        '&password=' + password +
        '&email=' + email +
        '&code=' + code;
    post(url, data, function (resp) {
        console.log(resp)
        if (resp == 'code wrong') { alert('验证码错误'); }
        else if (resp == 'email registered') { alert('此邮箱已注册'); }
        else if (resp == 'account existed') { alert('此账号已存在'); }
        else if (resp == 'success') {
            alert('注册成功');
            switchTo('./index.html');
        }
    })
};

function confirm() {
    var url, data, email;
    url = '/log/confirm/';
    email = getValueById('email');
    if (!email) { alert('请输入邮箱'); return; };
    data = 'email=' + email;
    post(url, data, function (resp) {
        console.log(resp);
        if (resp == 'send email error') { alert('验证码发送失败，请检查邮箱'); }
        else if (resp == 'success') {
            alert('验证码已发送至邮箱: ' + email);
        };
    });
}