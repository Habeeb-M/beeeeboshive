//CHANGE BACKGROUND WITH TIME
const bottomLayer = document.getElementById("bg-bottom")
const topLayer = document.getElementById("bg-top")
const videoLayer = document.getElementById("bg-video")
const desyncCheckbox = document.getElementById("desyncCheckbox")
const pauseButton = document.getElementById("pauseButton")
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
    if (desyncCheckbox.checked) return; //don't run if unsynced
    
    let date = new Date();
    currentIndex = date.getHours(); //replace with hours eventually

    let nextImage = `url('img/${currentIndex}.png')`;
    updateImage(currentImage, nextImage)
    currentImage = nextImage //update currentimage
}
let backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval); //and run this every updateinterval




// desync functionality
videoLayer.style.display = "none";


function desyncFunction() { //desync checkbox and turn on skipping controls
    const isDesynced = desyncCheckbox.checked 

    if (isDesynced) {
        clearInterval(backgroundUpdateInterval) //stop backgroundupdate
        for (let elem of pauseControls) { //reveal controls
            elem.style.display = "";
        }
        backgroundTime(currentIndex); //show simulated time
    }
    else {
        backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval);
        for (let elem of pauseControls) {
            elem.style.display = "none"; //hide controls
        }
        backgroundTime() //show synced time
    };
}
window.addEventListener('DOMContentLoaded', desyncFunction) //run on site load 
document.getElementById('desyncCheckbox').addEventListener('click', desyncFunction);





//VIDEO TRANSITION
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
    //return 1+10*x*(1-x)
    return 5
}
//make this better for longer videos - TODO

function inverseEase(x) { //this is the inverse of the INTEGRAL of ease
    return x/5
}

function indexToTime(x) { //now just record a loop of 2 days. dont have to deal with wrapping it around the end of the video
    return 5*x
}


let liveIndex = 0;
function easedVideo(startIndex, stopIndex) { //plays smooth video from start to stop and replaces background at end
    videoLayer.currentTime = indexToTime(startIndex);

    if (stopIndex < startIndex) { //wrap it around
        stopIndex += 24
    }

    const startTime = indexToTime(startIndex)
    const stopTime = indexToTime(stopIndex) 
    liveIndex = startIndex


    videoLayer.style.display = "";
    videoLayer.play();
    console.log(startIndex, "to", stopIndex, "or", startTime, "to", stopTime)

    videoLayer.addEventListener('timeupdate', checkPlaying); //while playing, check if stopped 
    function checkPlaying() {

        let currentImage = `url('img/${currentIndex}.png')`;
        let liveImage = `url('img/${liveIndex}.png')`;
        updateImage(currentImage, liveImage)


        if (videoLayer.currentTime >= stopTime - 0.5) { //when stops naturally
            stoppingFunction("stopped")

            videoLayer.currentTime = stopTime; 
            backgroundTime(inverseEase(stopTime))
            return
        }

        if (!desyncCheckbox.checked) {//re-synced mid video
            stoppingFunction("desynced")

            backgroundTime();
            backgroundUpdate();
            return
        }
    }

    pauseButton.addEventListener('click', () => {//if video paused
            stoppingFunction("paused")
            
            backgroundTime(liveIndex);
            backgroundUpdate(currentIndex, liveIndex);
            return
        })

    let playbackUpdateInterval = setInterval(playbackRateUpdate, 100); //update playbackspeed every dt
    function playbackRateUpdate() {
        //console.log((videoLayer.currentTime-startTime)/totalTime)
        videoLayer.playbackRate = easeFunction((videoLayer.currentTime-startTime)/(stopTime-startTime))

        //update liveindex as video plays
        liveIndex = Math.floor((videoLayer.currentTime)/5) % 24
        backgroundTime(inverseEase(videoLayer.currentTime))
    }    

    function stoppingFunction(log) {
        videoLayer.pause();                  
        console.log(log);
        videoLayer.style.display = "none";
        liveIndex = Math.floor(liveIndex)
        currentIndex = liveIndex;

        clearInterval(playbackUpdateInterval);
        videoLayer.removeEventListener('timeupdate', checkPlaying); 
    }
}



//const startInput = document.getElementById('startInput'); temporary start button
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', function() { //start animation on click
    const stopIndex = parseFloat(document.getElementById('stopIndex').value);

    if (currentIndex == stopIndex) return;
    easedVideo(currentIndex, stopIndex);
});




//simulated time for bg
function backgroundTime(arg) {
    const backgroundText = document.getElementById("bg-text")

    if (arg === undefined) {
        backgroundText.innerHTML = `simulated time: <br> syncing to sol.3...`
        return
    }

    //turn decimal time to 24h format
    let hours = Math.floor(arg % 24);
    let mins = Math.round((arg - hours) % 24 * 60);
    //if 60
    hours = (mins == 60) ? (hours + 1) % 24 : hours;
    mins = (mins == 60) ? 0 : mins
    //pad with 0s
    hours = String(hours).padStart(2, '0');
    mins = String(mins).padStart(2, '0');

    backgroundText.innerHTML = `simulated time: <br> ${hours}:${mins}`
}








//sets up the masonry front page
export function setupMasonry() {
    const container = document.querySelector('.container');
    const items = container.querySelectorAll('.container div');

    items.forEach(function(item) {
      const itemHeight = item.getBoundingClientRect().height;
      const rowSpan = Math.ceil(itemHeight);
      item.style.gridRowEnd = `span ${rowSpan}`;
    });

    // Displays the container cleanly once heights are locked in
    container.classList.add('masonry-ready');
  }

document.addEventListener('DOMContentLoaded', setupMasonry); //run on page load
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes


function setupBorder() {
    const items = document.querySelectorAll('.border');

    items.forEach(function(item) {
        const borderCorner = document.createElement('img');
        borderCorner.src = 'img/border2.png';
        item.appendChild(borderCorner);

        item.style.position = 'relative';
        borderCorner.style.position = 'absolute';
        borderCorner.style.bottom = '0px';
        borderCorner.style.right = '0px';
        borderCorner.style.width = "35%";
        borderCorner.style.imageRendering = "pixelated";
        borderCorner.style.opacity = "5%";
        }
    )
}
setupBorder()





