let isChessCom = true;
if(!window.location.href.includes("chess.com")){
    // don't run this code if not chess.com
    isChessCom = false;
}

function checkToShowButton(){
    if(!document.importToLichessButton){
        document.importToLichessButton = injectImportButton();
    }
    if (shouldShowImportButton()) {
        document.importToLichessButton.hidden = false;
        return;
    }
    //don't do anything if not on live chess
    document.importToLichessButton.hidden = true;
}

function injectImportButton() {
    let analyseButton = document.createElement("button");

    // Create a span element for the icon
    var iconSpan = document.createElement("span");
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.className = "ui_v5-button-icon icon-font-chess chess-board-search";
    
    // Append the icon span to the button
    analyseButton.appendChild(iconSpan);
    
    // Style the button
    analyseButton.style.position = "fixed";
    analyseButton.style.top = "5%"; // Adjust the top position as needed
    analyseButton.style.right = "10px"; // Adjust the right position as needed
    analyseButton.style.backgroundColor = "#363732"; // gray color
    analyseButton.style.color = "#C7C7C5";
    analyseButton.style.padding = ".5rem 0.5rem";
    analyseButton.style.border = "1px solid #272422"; // Border color
    analyseButton.style.borderRadius = "5px";
    analyseButton.style.cursor = "pointer";
    analyseButton.style.fontSize = "16px";
    analyseButton.style.zIndex = 9999;
    analyseButton.innerHTML += "Lichess Analysis"
    document.body.appendChild(analyseButton);
    analyseButton.addEventListener("click", () => {
        //add event to button to import to lichess
        importGame();
    });
    return analyseButton;
}

function shouldShowImportButton(){
    const currentUrl = window.location.href;
    if(currentUrl.includes("chess.com/game")
    || currentUrl.includes("chess.com/live#g=")
    || currentUrl.includes("chess.com/play")){
        // if you are on live game but don't have a share button, don't show
        return getShareButton();
    }
    return false;
}

function getShareButton(){
    //find and press the share button
    const shareButtonClasses = [
        "icon-font-chess share daily-game-footer-icon",
        "icon-font-chess share live-game-buttons-button",
        "icon-font-chess share game-buttons-button",// in case of chess.com/live#g=
        "icon-font-chess share daily-game-footer-icon",// in case of chess.com/game/daily
        "icon-font-chess share daily-game-footer-button"// in case of chess.com/game/live
    ];

    let shareButton = null;
    for (let i = 0; i < shareButtonClasses.length; i++) {
         shareButton = document.getElementsByClassName(shareButtonClasses[i])[0];
         if(shareButton){
            break;
         }
    }
    if (!shareButton) {
        // in other cases, try to find the button by aria-label "Share"
        shareButton = document.querySelector('button[aria-label="Share"]');
    }
    return shareButton;
}

async function importGame() {
    const gameURL = window.location.href.trim();
    //website check
    if (!gameURL.includes("chess.com")) {
        alert("You are not on chess.com! Press me when you are viewing the game you'd like to analyze!")
        throw new Error("Wrong website");
    }

    if(localStorage.getItem(gameURL)){
        // this game was cached before!
        window.open(localStorage.getItem(gameURL));
        return;
    }

    const shareButton = getShareButton();
    
    if (!shareButton) {
        alert("I could not find the fen! The game is probably not finished. Try clicking me when the game is over.");
        throw new Error("No share button");
    }
    shareButton.click();

    const pgnTabButton = await waitForElement("#tab-pgn", 5000);
    if(!pgnTabButton){
        console.log("Could not get the pgn tab button");
        return;
    }
    pgnTabButton.click();
    
    //find pgn window and copy the text value
    const pgnTextArea = await waitForElement(".share-menu-tab-pgn-textarea");
    if(!pgnTextArea){
        console.log("Could not get the pgn text area");
        return;
    }
    let gamePGN = pgnTextArea.value;
    //close the share window
    let closeButton = await waitForElement(".cc-close-button-component");

    if (closeButton) {
        console.log("Found closeButton via waitForElement");
    }
    if (!closeButton) {
        closeButton = document.getElementsByClassName("icon-font-chess x share-menu-close-icon")[0];
        console.log("Found closeButton via getElementsByClassName");
    }
    if (!closeButton) {
        closeButton = document.querySelector('[aria-label="Close"]');
        console.log("Found closeButton via aria label");
    }
    if (closeButton) {
        try {
            closeButton.click();
        } catch (error) {
            console.log("Could not click the found closeButton");
        }
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
            const lichessImportedGameURL = `${url}?from_chesscom=true`; 
            window.open(lichessImportedGameURL);
            localStorage.setItem(gameURL, lichessImportedGameURL);
        } else alert("Could not import game");
    });
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

/**
 * 🕵️ Listens for DOM changes and resolves a Promise when an element 
 * matching the selector is found. This is more performant than polling.
 * * @param {string} selector - The CSS selector for the element (e.g., "#tab-pgn").
 * @param {number} timeout - The maximum time to wait in milliseconds.
 * @returns {Promise<Element|null>} - A promise that resolves with the element or null if timed out.
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        // 1. Check if the element already exists
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }

        let timer = null;

        // 2. Setup the observer
        const observer = new MutationObserver((mutationsList, observer) => {
            // Check for the element on every change
            const targetElement = document.querySelector(selector);
            if (targetElement) {
                // Element found!
                clearTimeout(timer);
                observer.disconnect(); // Stop observing
                resolve(targetElement);
            }
        });

        // 3. Start observing the entire document body for new children/sub-trees
        observer.observe(document.body, { childList: true, subtree: true });

        // 4. Setup the timeout mechanism
        timer = setTimeout(() => {
            observer.disconnect(); // Stop observing on timeout
            reject(new Error(`Timeout waiting for element: ${selector}`));
        }, timeout);
    });
}

if(isChessCom){
    // listen for changes, the event listeners don't seem to work
    setInterval(()=>{
        checkToShowButton();
    }, 500);
    checkToShowButton(); 
}
