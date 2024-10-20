function find() {
    var email = getValueById('email');
    var url = '/log/find/';
    var data = 'email=' + email;
    if (!email) { alert('请输入邮箱'); return; };
    post(url, data, function (resp) {
        if (resp == 'success') { alert('账号密码已发送至邮箱'); }
        else if (resp == 'email not exist') { alert('该邮箱未注册账号'); }
        else if (resp == 'send email error') { alert('邮件发送失败'); };
    });
};