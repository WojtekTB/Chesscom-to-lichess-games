
document.onkeydown = (e) => {
  if (e.key == "f") {
    fullScreen();
  }

  if (e.key == "r") {
    rotateBoard();
  }

  if (e.key == "p") {
    //run annalysis
    console.log("run annalysis");
    document.getElementsByClassName("icon-font-chess share daily-game-footer-icon")[0].click();
    setTimeout(() => {
      document.getElementsByClassName("board-tab-item-underlined-component share-menu-tab-selector-tab")[0].click();
      setTimeout(() => {
        let gamePGN = document.getElementsByClassName("form-textarea-component share-menu-tab-pgn-textarea")[0].value;
        copyToClipboard(gamePGN);
      }, 100);
    }, 100);
  }
  if (e.key == "o") {
    let newURL = "https://lichess.org/analysis";
    let win = window.open(newURL, "_blank")
    win.focus();

  }
};

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function rotateBoard() {
  attemptToClickKey("board-controls-flip");
}

function fullScreen() {
  attemptToClickKey("board-controls-focus");
}

function attemptToClickKey(keyId) {
  let key = document.getElementById(keyId);
  key.click();
}