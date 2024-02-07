(function () {
    //check if on right website
    let currentUrl = window.location.href;

    if (!currentUrl.includes("chess.com/game/live")
        && !currentUrl.includes("chess.com/live#g=")
        && !currentUrl.includes("chess.com/game/daily")) {
        //don't do anything if not on live chess
        console.log("bad url");
        return;
    }
    let buttonInterval = setInterval(() => {
        //try to get button until the page loads
        let buttonContainer = document.getElementsByClassName("daily-game-footer-middle")[0];
        if (!buttonContainer) buttonContainer = document.getElementsByClassName("move-list-buttons-component live-game-buttons-arrows")[0];
        if (!buttonContainer) buttonContainer = document.getElementsByClassName("daily-game-footer-middle")[0];
        if (!buttonContainer) buttonContainer = document.getElementsByClassName("live-game-buttons-button-row")[0];
        if (!buttonContainer) buttonContainer = document.getElementsByClassName("live-game-buttons-component")[0];

        
        if (!buttonContainer) {
            return;
        }
        //check if we already added an instance of the button to the web page
        if (buttonContainer.getElementsByClassName("ImportToLichessButton").length > 0) {
            clearInterval(buttonInterval);
            return;
        }
        let analyseButton = document.createElement("button");
        //separating font settings and other style settings to be cleaner
        analyseButton.className = "ImportToLichessButton";
        let buttonStyle = "background-color: #7fa650;\n" +
            "  white-space: nowrap;\n" +
            "  color: #fff;\n" +
            "  border: none;\n" +
            "  color: white;\n" +
            "  text-align: center;\n" +
            "  text-decoration: none;\n" +
            "  display: inline-block;\n" +
            "  width: 9rem;\n" +
            "  height: 2.9rem;\n" +
            "  border-radius: 4px;\n" +
            "  font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;\n" +
            "  font-weight: bold;";
        analyseButton.style = buttonStyle;
        analyseButton.innerHTML = "IMPORT"
        buttonContainer.appendChild(analyseButton);
        analyseButton.addEventListener("click", () => {
            //add event to button to import to lichess
            importGame();
        })
        //clear the interval
        clearInterval(buttonInterval);
    }, 500);

})();

function importGame() {
    //website check
    if (!window.location.href.includes("chess.com")) {
        alert("You are not on chess.com! Press me when you are viewing the game you'd like to analyze!")
        throw new Error("Wrong website");
    }
    //url on game check
    if (!window.location.href.includes("chess.com/game/live")
        && !window.location.href.includes("chess.com/live#g=")
        && !window.location.href.includes("chess.com/game/daily")) {
        alert("You are not on viewing a game! Press me when you are viewing the game you'd like to analyze! (when url contains chess.com/game/live)")
        throw new Error("Not on game");
    }

    //find and press the share button
    let shareButton = document.getElementsByClassName("icon-font-chess share daily-game-footer-icon")[0];
    if (!shareButton) {
        shareButton = document.getElementsByClassName("icon-font-chess share live-game-buttons-button")[0];
    }
    if (!shareButton) {
        // in case of chess.com/live#g=
        shareButton = document.getElementsByClassName("icon-font-chess share game-buttons-button")[0];
    }
    if (!shareButton) {
        // in case of chess.com/game/daily
        shareButton = document.getElementsByClassName("icon-font-chess share daily-game-footer-icon")[0];
    }
    if (!shareButton) {
        // in case of chess.com/game/live
        shareButton = document.getElementsByClassName("icon-font-chess share daily-game-footer-button")[0];
    }

    if (!shareButton) {
        // in other cases, try to find the button by aria-label "Share"
        shareButton = document.querySelector('button[aria-label="Share"]');
    }

    if (!shareButton) {
        alert("The game is probably not finished. Try clicking me when the game is over.");
        throw new Error("No share button");
    }
    shareButton.click();
    setTimeout(() => {
        //find and press the tab with pgn
        document.getElementsByClassName("board-tab-item-underlined-component share-menu-tab-selector-tab")[0].click();
        setTimeout(() => {
            //find pgn window and copy the text value
            let gamePGN = document.getElementsByClassName("share-menu-tab-pgn-textarea")[0].value;
            //close the share window
            let closeButton = document.getElementsByClassName("icon-font-chess x icon-font-secondary")[0];
            if (!closeButton) {
                closeButton = document.getElementsByClassName("icon-font-chess x share-menu-close-icon")[0];
            }
            if (closeButton) {
                closeButton.click();
            }
            //make sure the game pgn has value, if not, need to stop
            if (!gamePGN.trim()) {
                alert("Not a valid PGN! Make sure you are on chess.com/games! If this is not correct please contact the creator.")
                return;
            }

            //make sure that the game is finished in some way
            if (!gamePGN.includes("[Termination")) {
                //don't import unfinished games, personal policy
                alert("Can only import finished games!");
                return;
            }


            //send a post request to lichess to import a game
            requestLichessURL(gamePGN, (url) => {
                if (url) {
                    let lichessGameWindow = window.open(url);
                } else alert("Could not import game");

            });
        }, 1);
    }, 500);

}

//async post function
async function requestLichessURL(pgn, callback) {
    let url = "https://lichess.org/api/import";
    chrome.runtime.sendMessage(
        {
            data: {pgn: pgn}, 
            url: url
        }, function (response) {
            if (response != undefined && response != "") {
                callback(response);
            }
            else {
                callback(null);
            }
        });
}