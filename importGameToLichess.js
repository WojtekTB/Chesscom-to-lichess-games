if (!window.location.href.includes("chess.com")) {
    alert("You are not on chess.com! Press me when you are viewing the game you'd like to analyze!")
    throw new Error("Wrong website");
}
if (!window.location.href.includes("chess.com/game/live")) {
    alert("You are not on viewing a game! Press me when you are viewing the game you'd like to analyze! (when url contains chess.com/game/live)")
    throw new Error("Not on game");
}

document.getElementsByClassName("icon-font-chess share daily-game-footer-icon")[0].click();
setTimeout(() => {
    document.getElementsByClassName("board-tab-item-underlined-component share-menu-tab-selector-tab")[0].click();
    setTimeout(() => {
        let gamePGN = document.getElementsByClassName("form-textarea-component share-menu-tab-pgn-textarea")[0].value;

        document.getElementsByClassName("icon-font-chess x icon-font-secondary")[0].click();

        if (!gamePGN.trim()) {
            alert("Not a valid PGN! Make sure you are on chess.com/games! If this is not correct please contact the creator.")
            return;
        }

        lichessImportUrl = "https://lichess.org/api/import"
        let requestData = {pgn: gamePGN};
        postData(lichessImportUrl, requestData)
            .then((response) => {
                let url = response["url"] ? response["url"] : "";
                if (url) {
                    let lichessGameWindow = window.open(url);
                } else alert("Could not import game");

            });
    }, 1);
}, 1);


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