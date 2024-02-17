document.addEventListener('DOMContentLoaded', function () {
    var checkButton = document.getElementById('crawlButton');
    checkButton.addEventListener('click', function () {
        document.getElementById('message').textContent = 'Success';
    }, false);
}, false);
