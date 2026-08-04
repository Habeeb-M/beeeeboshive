//CHANGE BACKGROUND WITH TIME
const bottomLayer = document.getElementById("bg-bottom")
const topLayer = document.getElementById("bg-top")
const videoLayer = document.getElementById("bg-video")
const pauseCheckbox = document.getElementById("pauseCheckbox")
const pauseControls = document.getElementsByClassName("pauseControls")
const buffer = 500 //time before top layer becomes bottom layer i.e. how long it takes to load new image
const updateInterval = 1000; //update every second  to check if bg needs to change.. can increase this


//change currentimage to nextimage, input two images
function updateImage(currentImage, nextImage) {
    if (nextImage != currentImage) {
        bottomLayer.style.backgroundImage = nextImage;
        topLayer.style.opacity = 0;

        setTimeout( function() { //after transition make top layer into bottom
            topLayer.style.backgroundImage = nextImage;
            topLayer.style.opacity = 1;
            //console.log(`changing ${currentImage} to ${nextImage}`)
        }, buffer); 
    }
}


let currentImage = "";
let currentIndex = 0;
function backgroundUpdate() {
    if (pauseCheckbox.checked) return; //don't run if paused
    
    let date = new Date();
    currentIndex = date.getSeconds() % 24 + 1; //replace with hours eventually

    var nextImage = `url('img/${currentIndex}.png')`;
    updateImage(currentImage, nextImage)
    currentImage = nextImage //update currentimage
}
var backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval); //and run this every updateinterval




// pause functionality
videoLayer.style.display = "none";


function pauseFunction() { //pause checkbox and turn on skipping controls
    const isPaused = pauseCheckbox.checked 

    if (isPaused) {
        clearInterval(backgroundUpdateInterval) //stop backgroundupdate
        for (let elem of pauseControls) { //reveal controls
            elem.style.display = "";
        }
    }
    else {
        backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval);
        for (let elem of pauseControls) {
            elem.style.display = "none"; //hide controls
        }
        backgroundUpdate() //update if unpaused
    };
}
window.addEventListener('DOMContentLoaded', pauseFunction) //run on site load 




//VIDEO TRANSITION
//const startInput = document.getElementById('startInput'); temporary start button
const stopInput = document.getElementById('stopInput');
const sendButton = document.getElementById('sendButton');



function linearVideo() { //not used... just for testing
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


//just a speed function on [0,1] that starts/ends at 1 and speeds up in middle
function easeFunction(x) {
    return 1+10*x*(1-x)
}


function easedVideo(startInput, stopInput, endIndex) { //plays smooth video from start to stop and replaces background at end
    videoLayer.currentTime = startInput;

    videoLayer.style.display = "";
    const N = 40; //amount of updates of playback speed
    const totalTime = stopInput - startInput;
    const dt = totalTime/N;

    videoLayer.play();
    //console.log(startInput, "to", stopInput)

    videoLayer.addEventListener('timeupdate', checkPlaying); //while playing, check if stopped
    function checkPlaying() {
        if (stopInput - videoLayer.currentTime <= buffer) {//just before end, update background  
            currentImage = `url('img/${currentIndex}.png')`;
            endImage = `url('img/${endIndex}.png')`; //update background when done
            updateImage(currentImage, endImage)
            currentIndex = endIndex
        }


        if (videoLayer.currentTime >= stopInput) { //when stops
            videoLayer.pause();                  
            videoLayer.currentTime = stopInput; 
            //console.log("stopped")
            clearInterval(playbackUpdateInterval)
            
            videoLayer.removeEventListener('timeupdate', checkPlaying); 
            videoLayer.style.display = "none";
        }
    }

    playbackUpdateInterval = setInterval(playbackRateUpdate, dt*1000); //update playbackspeed every dt
    function playbackRateUpdate(time) {
        //console.log((videoLayer.currentTime-startInput)/totalTime)
        videoLayer.playbackRate = easeFunction((videoLayer.currentTime-startInput)/totalTime)
    }    
}


function indexToTime(x) { //now just record a loop of 2 days. dont have to deal with wrapping it around the end of the video
    return x*125/24
}


sendButton.addEventListener('click', function() {
    if (currentIndex == stopInput.value) return;

    console.log(currentIndex)
    easedVideo(indexToTime(currentIndex), indexToTime(stopInput.value), stopInput.value);
    //console.log(currentIndex, stopInput.value)
});



// FUN STUFF

//home page
function updateTime() {
            var now = new Date();
            var options = { hour: 'numeric', minute: '2-digit', hour12: false };
            document.getElementById("funCurrentTime").innerHTML = now.toLocaleTimeString([], options);
        }
        
updateTime(); //run on page load and update every second - could optimise to every minute
setInterval(updateTime, 1000);



function honeyProduction() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const elapsedMs = (now - startOfYear) / (24 * 60 * 60 * 1000);

    //console.log(elapsedMs, honeyProductionValue(elapsedMs))

    function sunExposure(x) {
        return Math.sin(2*Math.PI*x+1.64)-0.56*Math.sin(2*Math.PI*x/365 - 7.72)
    }
    function honeyProductionValue(x) {
        return 50*(1+Math.sin(2*Math.PI*x/365 + 1/2))*Math.max(0, -sunExposure(x))
    }
    document.getElementById("funCurrentHoney").innerHTML = honeyProductionValue(elapsedMs);
}
honeyProduction();

