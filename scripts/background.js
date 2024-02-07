chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {    
    if (request.contentScriptQuery == "getdata") {
        var url = request.url;
        fetch(url)
            .then(response => response.text())
            .then(response => sendResponse(response))
            .catch()
        return true;
    }
    if (request.contentScriptQuery == "postData") {
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
    }
});