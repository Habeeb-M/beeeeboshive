//CHANGE BACKGROUND WITH TIME
bottomLayer = document.getElementById("bg-bottom")
topLayer = document.getElementById("bg-top")
videoLayer = document.getElementById("bg-video")
pauseCheckbox = document.getElementById("pauseCheckbox")
pauseControls = document.getElementsByClassName("pauseControls")
buffer = 500 //time before top layer becomes bottom layer i.e. how long it takes to load new image
const updateInterval = 1000; //update every second  to check if bg needs to change.. can increase this


//change bg image to newindex
function updateImage(currentIndex, newIndex) {
    if (newIndex != currentIndex) {
        bottomLayer.style.backgroundImage = newIndex;
        topLayer.style.opacity = 0;
        setTimeout( function() {
            topLayer.style.backgroundImage = newIndex;
            topLayer.style.opacity = 1;
            //console.log(`changing ${currentIndex} to ${newIndex}`)
            currentIndex = newIndex;
        }, buffer); 
    }
}


let currentImg = "";
let currentIndex = 0;
function backgroundUpdate() {
    let date = new Date();
    let currentIndex = date.getSeconds() % 20 + 1; //replace with hours eventually

    var nextImg = `url('../img/${currentIndex}.png')`;
    updateImage(currentImg, nextImg)
}


//figure out how to set something on page load and then update with checkox
//to make this more efficient

var backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval); //on site load start
for (let elem of pauseControls) {
            elem.style.display = "none";
    }
videoLayer.style.display = "none";


function pauseFunction() { //pause checkbox and turn on skipping controls
    if (pauseCheckbox.checked == true) {
        clearInterval(backgroundUpdateInterval) //stop backgroundupdate
        for (let elem of pauseControls) { //reveal controls
            elem.style.display = "";
        }
    }
    else {
        backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval);
        for (let elem of pauseControls) {
            elem.style.display = "none";
        }
    };
}
pauseCheckbox.addEventListener('click', backgroundUpdate)




//VIDEO TRANSITION
//const videoLayer = document.getElementById('videoLayer');
const startInput = document.getElementById('startInput');
const stopInput = document.getElementById('stopInput');
const sendButton = document.getElementById('sendButton');



function linearVideo() {
    video.currentTime = startInput.value;
    video.playbackRate = 4;
    
    video.play();
    console.log(startInput.value, "to", stopInput.value)
     
    function checkTime() {
        if (video.currentTime >= stopInput.value) {
          video.pause();                  // Stop immediately
          video.currentTime = stopInput.value;    // Snap exactly to the end marker
        
          video.removeEventListener('timeupdate', checkTime); 
          console.log("Segment finished normally!");
        }
    }
    video.addEventListener('timeupdate', checkTime);
}


//ease function is 3*x**2 - 2*x**3, but we use derivative, and with a minimum speed to avoid framiness
function easeFunction(x) {
    return Math.max(0.5, (6*x-6*x**2))
}


function easedVideo() {
    videoLayer.style.display = "";
    videoLayer.currentTime = startInput.value;
    const N = 10; //amount of updates
    const totalTime = stopInput.value - startInput.value;
    var dt = totalTime/N;

    videoLayer.play();
    //console.log(startInput.value, "to", stopInput.value)

    videoLayer.addEventListener('timeupdate', checkPlaying);
    function checkPlaying() {
        if (videoLayer.currentTime >= stopInput.value) {
          videoLayer.pause();                  
          videoLayer.currentTime = stopInput.value; 
          //console.log("stopped")
          clearInterval(playbackUpdateInterval)
        
          videoLayer.removeEventListener('timeupdate', checkPlaying); 
          videoLayer.style.display = "none";
        }
    }

    playbackUpdateInterval = setInterval(playbackRateUpdate, dt*1000);
    function playbackRateUpdate(time) {
        //console.log(video.currentTime)
        //console.log(easeFunction(video.currentTime/totalTime))
        videoLayer.playbackRate = easeFunction(videoLayer.currentTime/totalTime)
    }    
}

sendButton.addEventListener('click', function() {
    easedVideo();
    console.log(currentIndex, stopInput.value)
    updateImage(currentIndex, stopInput.value)
}); //have to write it like function() {} ?? or errors.





