function logOut() {
    localStorage.removeItem('code');
    document.location.href = './log/index.html';
};

function getCity() {
    var url = '/place/';
    get(url, function (resp) {
        if (resp != 'fail') {
            var elements = document.getElementsByClassName('city');
            for (var i = 0; i < elements.length; i++) {
                elements[i].innerHTML = resp;
            }
        }
    })
}

checkLogged();
addLoadEvent(getCity);