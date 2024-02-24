
function onRatingNow(){
    // Open the Chrome Web Store page for your extension where users can leave a review
    window.open('https://chromewebstore.google.com/detail/ucsd-schedule-visualizer/jkaheldanccinoefddienccoblmcmhgn/reviews', '_blank');
    // You should replace 'your-extension-id' with the actual ID of your extension
    document.ratingWindow.remove(); // Remove the rating window after opening the review page
    localStorage.setItem('extensionRatingWindowClosed', Infinity);
}

function onRatingDismiss(){
    // Dismiss the window without taking any action
    document.ratingWindow.remove();
    localStorage.setItem('extensionRatingWindowClosed', 20+Math.random() * 10);
}

function getRatingWindow(){
    return document.ratingWindow;
}

function getCloserToShowingRatingWindow(){
    if(localStorage.getItem('extensionRatingWindowClosed') === null){
        localStorage.setItem('extensionRatingWindowClosed', (Math.random() * 4)+15);
    }
    localStorage.setItem('extensionRatingWindowClosed', localStorage.getItem('extensionRatingWindowClosed')-1);
}

function showRatingWindow() {
    if(localStorage.getItem('extensionRatingWindowClosed') === null){
        localStorage.setItem('extensionRatingWindowClosed', (Math.random() * 4)+15);
    }
    if (localStorage.getItem('extensionRatingWindowClosed') > 0) {
        return; // If so, do not show the rating window again
    }
    if(document.ratingWindow){
        return; // already showing a rating window
    }
    // Create a div element for the rating window
    document.ratingWindow = document.createElement('div');
    document.ratingWindow.style.position = 'fixed';
    document.ratingWindow.style.top = '9%'; // Adjust the top position as needed
    document.ratingWindow.style.right = '10px'; // Adjust the right position as needed
    document.ratingWindow.style.width = '30vw';
    document.ratingWindow.style.backgroundColor = '#fff';
    document.ratingWindow.style.padding = '20px';
    document.ratingWindow.style.border = '1px solid #ccc';
    document.ratingWindow.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    document.ratingWindow.style.textAlign = 'center';
    document.ratingWindow.style.zIndex = 99999;
    document.ratingWindow.innerHTML = `
        <div style="display: inline-block; text-align: center;">
        <p>Hey!</p>
        <p>My name is Victor. I am a college student who made the UCSD Schedule Visualizer extension! </p>
        <p>I made it on my own time entirely for free.</p>
        <p>I would really appreciate it if you could rate it on google chrome store, or could share it with your classmates!</p>
        <p>It would help me and my work a lot!</p>
            <div style="display: inline-block; text-align: left;">
                <p>Thank you!</p>
            </div>
        </div>
      <button id="rateButton" style="padding: 10px 20px; background-color: #4CAF50; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Rate Now</button>
      <button id="dismissButton" style="margin-left: 10px; padding: 10px 20px; background-color: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer;">Dismiss</button>
    `;
  
    // Append the rating window to the body
    document.body.appendChild(document.ratingWindow);

    document.getElementById('rateButton').addEventListener('click', onRatingNow);
    document.getElementById('dismissButton').addEventListener('click', onRatingDismiss);
}