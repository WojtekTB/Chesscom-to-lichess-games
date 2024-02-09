let isLichess = true;
if(!window.location.href.includes("lichess.org")){
    // don't run this code if not chess.com
    isLichess = false;
}

if(isLichess){
    if(window.location.href.includes("?from_chesscom=true")){
        const analysisBtnContainer = document.getElementsByClassName("future-game-analysis")[0];
        if(analysisBtnContainer){
            analysisBtnContainer.getElementsByTagName("button")[0].click();
        }
    }
}