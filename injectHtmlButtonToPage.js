(function () {
    //check if on right website
    let currentUrl = window.location.href;
    if (!currentUrl.includes("chess.com/game/live") && !currentUrl.includes("chess.com/live#g=")) {
        //don't do anything if not on live chess
        console.log("bad")
        return;
    }
    let buttonInterval = setInterval(() => {
        //try to get button until the page loads
        let buttonContainer = document.getElementsByClassName("daily-game-footer-middle")[0];
        if (!buttonContainer) {
            return;
        }
        let analyseButton = document.createElement("button");
        //separating font settings and other style settings to be cleaner
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
            // chrome.tabs.executeScript(null, {file: "importGameToLichess.js"});
        })
        //clear the interval
        clearInterval(buttonInterval);
    }, 500)

})();