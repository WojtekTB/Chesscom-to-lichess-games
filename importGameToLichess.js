(function () {//wrapping the whole function in a anon function to ensure that the variables do not persist
//website check
    if (!window.location.href.includes("chess.com")) {
        alert("You are not on chess.com! Press me when you are viewing the game you'd like to analyze!")
        throw new Error("Wrong website");
    }
//url on game check
    if (!window.location.href.includes("chess.com/game/live")) {
        alert("You are not on viewing a game! Press me when you are viewing the game you'd like to analyze! (when url contains chess.com/game/live)")
        throw new Error("Not on game");
    }

//find and press the share button
    let shareButton = document.getElementsByClassName("icon-font-chess share daily-game-footer-icon")[0];
    if (!shareButton) {
        shareButton = document.getElementsByClassName("icon-font-chess share live-game-buttons-button")[0];
    }
    shareButton.click();
    setTimeout(() => {
        //find and press the tab with pgn
        document.getElementsByClassName("board-tab-item-underlined-component share-menu-tab-selector-tab")[0].click();
        setTimeout(() => {
            //find pgn window and copy the text value
            let gamePGN = document.getElementsByClassName("form-textarea-component share-menu-tab-pgn-textarea")[0].value;
            //close the share window
            document.getElementsByClassName("icon-font-chess x icon-font-secondary")[0].click();
            //make sure the game pgn has value, if not, need to stop
            if (!gamePGN.trim()) {
                alert("Not a valid PGN! Make sure you are on chess.com/games! If this is not correct please contact the creator.")
                return;
            }
            let lichessImportUrl = "https://lichess.org/api/import"
            let requestData = {pgn: gamePGN};
            //send a post request to lichess to import a game
            postData(lichessImportUrl, requestData)
                .then((response) => {
                    //on response, open the lichess game url window in a new tab 
                    let url = response["url"] ? response["url"] : "";
                    if (url) {
                        let lichessGameWindow = window.open(url);
                    } else alert("Could not import game");

                });
        }, 1);
    }, 1);
})();

//async post function
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