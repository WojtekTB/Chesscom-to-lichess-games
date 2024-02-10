let isChessCom = true;
if(!window.location.href.includes("chess.com")){
    // don't run this code if not chess.com
    isChessCom = false;
}

function checkToShowButton(){
    const currentUrl = window.location.href;
    if(!document.importToLichessButton){
        document.importToLichessButton = injectImportButton();
    }
    if (!currentUrl.includes("chess.com/game/live")
        && !currentUrl.includes("chess.com/live#g=")
        && !currentUrl.includes("chess.com/game/daily")) {
        //don't do anything if not on live chess
        document.importToLichessButton.hidden = true;
        return;
    }
    document.importToLichessButton = true;
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
    analyseButton.style.top = "10px"; // Adjust the top position as needed
    analyseButton.style.right = "10px"; // Adjust the right position as needed
    analyseButton.style.backgroundColor = "#363732"; // gray color
    analyseButton.style.color = "#C7C7C5";
    analyseButton.style.padding = ".5rem 0.5rem";
    analyseButton.style.border = "1px solid #272422"; // Border color
    analyseButton.style.borderRadius = "5px";
    analyseButton.style.cursor = "pointer";
    analyseButton.style.fontSize = "16px";
    analyseButton.innerHTML += "Lichess Analysis"
    document.body.appendChild(analyseButton);
    analyseButton.addEventListener("click", () => {
        //add event to button to import to lichess
        importGame();
    });
    return analyseButton;
}

async function importGame() {
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
            let lichessGameWindow = window.open(`${url}?from_chesscom=true`);
            localStorage.setItem('extensionRatingWindowClosed', localStorage.getItem('extensionRatingWindowClosed')-1);
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

  function showRatingWindow() {
    if (localStorage.getItem('extensionRatingWindowClosed') > 0) {
        return; // If so, do not show the rating window again
    }
    // Create a div element for the rating window
    const ratingWindow = document.createElement('div');
    ratingWindow.style.position = 'fixed';
    ratingWindow.style.top = '40px'; // Adjust the top position as needed
    ratingWindow.style.right = '10px'; // Adjust the right position as needed
    ratingWindow.style.width = '30vw';
    ratingWindow.style.backgroundColor = '#fff';
    ratingWindow.style.padding = '20px';
    ratingWindow.style.border = '1px solid #ccc';
    ratingWindow.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    ratingWindow.style.textAlign = 'center';
    ratingWindow.style.zIndex = 99999;
    ratingWindow.innerHTML = `
        <div style="display: inline-block; text-align: center;">
        <p>Hey!</p>
        <p>My name is Victor. I am a college student who made the Lichess-to-Chesscom extension! </p>
        <p>I made it on my own time entirely for free.</p>
        <p>I would really appreciate it if you could rate it on google chrome store!</p>
            <div style="display: inline-block; text-align: left;">
                <p>Thank you!</p>
            </div>
        </div>
      <button id="rateButton" style="padding: 10px 20px; background-color: #4CAF50; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Rate Now</button>
      <button id="dismissButton" style="margin-left: 10px; padding: 10px 20px; background-color: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer;">Dismiss</button>
    `;
  
    // Append the rating window to the body
    document.body.appendChild(ratingWindow);
  
    // Add event listeners to the rate and dismiss buttons
    document.getElementById('rateButton').addEventListener('click', function() {
      // Open the Chrome Web Store page for your extension where users can leave a review
      window.open('https://chromewebstore.google.com/detail/chesscom-to-lichess/jblnpdempinkonbjejolagghdofaipjf/reviews', '_blank');
      // You should replace 'your-extension-id' with the actual ID of your extension
      ratingWindow.remove(); // Remove the rating window after opening the review page
      localStorage.setItem('extensionRatingWindowClosed', 999999999);
    });
  
    document.getElementById('dismissButton').addEventListener('click', function() {
      // Dismiss the window without taking any action
      ratingWindow.remove();
      localStorage.setItem('extensionRatingWindowClosed', 10+Math.random() * 10);
    });
  }

if(isChessCom){
    // store url on load
    let currentPage = window.location.href;

    // listen for changes, the event listeners don't seem to work
    setInterval(()=>{
        if (currentPage != window.location.href)
        {
            currentPage = window.location.href;
            checkToShowButton();
        }
    }, 500);
    checkToShowButton(); 
    showRatingWindow();  
    if(localStorage.getItem('extensionRatingWindowClosed') === null){
        localStorage.setItem('extensionRatingWindowClosed', 3);
    }
}
