chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let formBody = [];
    for (let property in request.data) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(request.data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    fetch(request.url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
    })
        .then(response => {
            return sendResponse(response.url);
        })
        .catch(error => console.log('Error:', error));
    return true;
});