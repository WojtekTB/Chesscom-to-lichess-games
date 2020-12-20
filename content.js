
document.onkeydown = (e) => {
    if(e.key == "f")
    {
        fullScreen();
    }

    if(e.key == "r")
    {
        rotateBoard();
    }
  };

  function rotateBoard()
  {
    attemptToClickKey("board-controls-flip");
  }

  function fullScreen()
  {
    attemptToClickKey("board-controls-focus");
  }

  function attemptToClickKey(keyId)
  {
    let key = document.getElementById(keyId);
    key.click();
  }