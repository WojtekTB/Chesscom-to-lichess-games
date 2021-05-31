document.getElementsByClassName("icon-font-chess share daily-game-footer-icon")[0].click();
setTimeout(() => {
    document.getElementsByClassName("board-tab-item-underlined-component share-menu-tab-selector-tab")[0].click();
    setTimeout(() => {
        let gamePGN = document.getElementsByClassName("form-textarea-component share-menu-tab-pgn-textarea")[0].value;
        lichessImportUrl = "https://lichess.org/api/import"
        let requestData = {pgn: gamePGN};
        postData(lichessImportUrl, requestData)
            .then((response) => {
                let url = response["url"] ? response["url"] : "";
                if (url) {
                    window.open(url);
                } else alert("Could not import game")

            });
    }, 50);
}, 50);


async function postData(url = '', data = {}) {
    var formBody = [];
    for (var property in data) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(data[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
    });
    return response.json(); // parses JSON response into native JavaScript objects
}