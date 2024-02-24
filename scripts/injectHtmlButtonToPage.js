let isChessCom = true;
if(!window.location.href.includes("chess.com")){
    // don't run this code if not chess.com
    isChessCom = false;
}

function checkToShowButton(){
    if(!document.importToLichessButton){
        document.importToLichessButton = injectImportButton();
    }
    showRatingWindow();
    const ratingWindow = getRatingWindow();
    if (shouldShowImportButton()) {
        document.importToLichessButton.hidden = false;
        if(ratingWindow){
            ratingWindow.hidden = false;
        }
        return;
    }
    //don't do anything if not on live chess
    document.importToLichessButton.hidden = true;
    if(ratingWindow){
        ratingWindow.hidden = true;
    }
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
    if(currentUrl.includes("chess.com/game/live")
    || currentUrl.includes("chess.com/live#g=")
    || currentUrl.includes("chess.com/game/daily")){
        // if you are on live game but don't have a share button, don't show
        if(currentUrl.includes("chess.com/game/live") && !getShareButton()){
            return false;
        }
        return true;
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
    //url on game check
    if (!gameURL.includes("chess.com/game/live")
        && !gameURL.includes("chess.com/live#g=")
        && !gameURL.includes("chess.com/game/daily")) {
        alert("You are not on viewing a game! Press me when you are viewing the game you'd like to analyze! (when url contains chess.com/game/live)")
        throw new Error("Not on game");
    }

    if(localStorage.getItem(gameURL)){
        // this game was cached before!
        window.open(localStorage.getItem(gameURL));
        getCloserToShowingRatingWindow();
        return;
    }

    const shareButton = getShareButton();
    
    if (!shareButton) {
        alert("I could not find the fen! The game is probably not finished. Try clicking me when the game is over.");
        throw new Error("No share button");
    }
    shareButton.click();

    const pgnTabButton = await findElementByClassName("board-tab-item-underlined-component share-menu-tab-selector-tab");
    if(!pgnTabButton){
        console.log("Could not get the pgn");
        return;
    }
    
    //find pgn window and copy the text value
    const pgnTextArea = await findElementByClassName("share-menu-tab-pgn-textarea");
    if(!pgnTextArea){
        console.log("Could not get the pgn");
        return;
    }
    let gamePGN = pgnTextArea.value;
    //close the share window
    let closeButton = document.getElementsByClassName("icon-font-chess x icon-font-secondary")[0];
    if (!closeButton) {
        closeButton = document.getElementsByClassName("icon-font-chess x share-menu-close-icon")[0];
    }
    if (!closeButton) {
        closeButton = closeButton = document.querySelector('[aria-label="Close"]');;
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
            const lichessImportedGameURL = `${url}?from_chesscom=true`; 
            const lichessGameWindow = window.open(lichessImportedGameURL);
            localStorage.setItem('extensionRatingWindowClosed', localStorage.getItem('extensionRatingWindowClosed')-1);
            localStorage.setItem(gameURL, lichessImportedGameURL);
            getCloserToShowingRatingWindow();
            showRatingWindow();
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
function findElementByClassName(className, maxAttempts = Infinity, interval = 100, minDuration = 4000) {
    return new Promise((resolve, reject) => {
      let startTime = Date.now();
      let attempts = 0;
  
      function search() {
        const element = document.getElementsByClassName(className)[0];
        
        if (element) {
          resolve(element);
        } else {
          attempts++;
  
          if (attempts < maxAttempts && (Date.now() - startTime) < minDuration) {
            setTimeout(search, interval);
          } else {
            resolve(null);
          }
        }
      }
  
      search();
    });
  }

if(isChessCom){
    // listen for changes, the event listeners don't seem to work
    setInterval(()=>{
        checkToShowButton();
    }, 500);
    checkToShowButton(); 
      
    if(localStorage.getItem('extensionRatingWindowClosed') === null){
        localStorage.setItem('extensionRatingWindowClosed', 3);
    }
}
