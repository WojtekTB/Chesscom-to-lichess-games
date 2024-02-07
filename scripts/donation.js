$(document).ready(function () {
    $('body').on('click', 'a', function () {
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });
});

$(document).ready(function () {
    $('body').on('click', 'input', function () {
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });
});