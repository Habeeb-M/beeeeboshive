//CHANGE BACKGROUND WITH TIME
const bottomLayer = document.getElementById("bg-bottom")
const topLayer = document.getElementById("bg-top")
const videoLayer = document.getElementById("bg-video")
const desyncCheckbox = document.getElementById("desyncCheckbox")
const pauseButton = document.getElementById("pauseButton")
const weatherButton = document.getElementById("weatherButton")
const weatherSyncButton = document.getElementById("weatherSyncButton")
const pauseControls = document.getElementsByClassName("pauseControls")
const buffer = 500 //time before top layer becomes bottom layer i.e. how long it takes to load new image
const updateInterval = 1000; //update every second  to check if bg needs to change.. can increase this

function getCurrentHour() {
    let date = new Date();
    return date.getHours();
}

function modulo(a,b) { return ((a % b) + b) % b }


//change currentimage to nextimage
function updateImage(currentImage, nextImage) {
    if (nextImage != currentImage) {
        bottomLayer.style.backgroundImage = nextImage;
        topLayer.style.opacity = 0;

        setTimeout( function() { //after transition make top layer into bottom
            topLayer.style.backgroundImage = nextImage;
            topLayer.style.opacity = 1;
            console.log(`changing ${currentImage} to ${nextImage}`)
        }, buffer); 
    }
}


let currentImage = "";
let currentIndex = 0;
//hour sets currentindex, updates background and currentimage if different
function backgroundUpdate() {
    if (desyncCheckbox.checked) return; //don't run if unsynced
    
    currentIndex = getCurrentHour() 

    let nextImage = getBackgroundURL(currentIndex)
    updateImage(currentImage, nextImage)
    currentImage = nextImage //update currentimage
}
let backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval); //and run this every updateinterval


function getBackgroundURL(index) {
    return (currentWeather) ? `url('img/background/r${index}.png')` : `url('img/background/${index}.png')`
}


//VIDEO TRANSITION
videoLayer.style.display = "none";

// desync functionality
function desyncFunction() { //desync checkbox and turn on skipping controls
    const isDesynced = desyncCheckbox.checked 

    if (isDesynced) {
        clearInterval(backgroundUpdateInterval) //stop backgroundupdate
        for (let elem of pauseControls) { //reveal controls
            elem.style.display = "";
        }
        backgroundTime(currentIndex); //show simulated time

        //weather button
        weatherButton.addEventListener('click', weatherButtonFunction);

    }
    else {
        videoLayer.pause();

        let oldIndex = currentIndex //transition from desynced to synced
        currentIndex = getCurrentHour();
        let nextImage = getBackgroundURL(currentIndex);
        updateImage(getBackgroundURL(oldIndex), nextImage);
        currentImage = nextImage; // Synchronize global string state tracking

        backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval);
        for (let elem of pauseControls) {
            elem.style.display = "none"; //hide controls
        }
        backgroundTime() //show synced time

        //weather button
        weatherButton.removeEventListener('click', weatherButtonFunction);
    }
}
window.addEventListener('DOMContentLoaded', desyncFunction) //run on site load 
document.getElementById('desyncCheckbox').addEventListener('click', desyncFunction);





//make sure footage does a full day seamlessly
//ideally 20s in is sunrise in game so tick 48000 (i.e. 0) is 20s in
function linearVideo() { //depreciated
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
function easeFunction(x, a) {//a is like a scaling
    return Math.min(5, 1+4*a*x, 1+4*a*(1-x))
}
//make this better for longer videos - TODO

function inverseEase(x, a) { //this is the inverse indextotime??
    return x/5
}

function indexToTime(x) { //hour of real time to second of the video (index to input)
    return 5*x
}



//actual video transition
let liveIndex = 0;
let liveImage = "";

function easedVideo(startIndex, stopIndex) {
    //index is 0-23, time is the time of the video
    const startTime = indexToTime(startIndex)
    const stopTime = indexToTime(stopIndex) 
    const totalTime = modulo(stopTime-startTime, 120);

    //set video, start time
    videoLayer.src = (currentWeather) ? 'img/background/rbg-video.mp4' : 'img/background/bg-video.mp4'
    videoLayer.currentTime = indexToTime(startIndex);
    videoLayer.addEventListener('ended', () => videoLayer.play()); //have to loop manually

    //unhide and play video
    videoLayer.style.display = "";
    videoLayer.play();

    //runs every 100ms, updates playbackrate, currentimage, buttons, background time, the checkplaying - stops when video does
    let playbackUpdateInterval = setInterval(playbackRateUpdate, 100); 
    function playbackRateUpdate() {
        //console.log(videoLayer.currentTime,easeFunction(modulo((videoLayer.currentTime-startTime)/totalTime,1),totalTime+1))
        //console.log(videoLayer.currentTime, inverseEase(videoLayer.currentTime, totalTime+1))

        videoLayer.playbackRate = easeFunction(modulo((videoLayer.currentTime-startTime)/totalTime,1), totalTime+1)

        liveIndex = Math.floor((videoLayer.currentTime)/5) % 24
        updateIndexAndImage();

        pauseButton.disabled = false;
        weatherButton.disabled = true;
        
        backgroundTime(inverseEase(videoLayer.currentTime))

        checkPlaying()
    }

    //checks if video is supposed to end, or is resynced
    function checkPlaying() {
        if (!desyncCheckbox.checked) {//if resynced, reset time
            stoppingFunction("resynced")
            backgroundTime();
            backgroundUpdate()
            return
        }

        if (videoLayer.currentTime >= stopTime - 1 && videoLayer.currentTime < stopTime) { //when stops naturally
            //cant be just > stoptime as we allow loops to happen. update time to recent liveindex time
            //also as it stops just before need to update manually
            liveIndex += 1
            videoLayer.currentTime = stopTime; 
            videoLayer.pause();
            backgroundTime(inverseEase(stopTime))        
            updateIndexAndImage();
            stoppingFunction("stopped")
            return
        }
    }

    //or paused. update time to liveindex, and background
    pauseButton.addEventListener('click', pauseButtonFunction) 
    function pauseButtonFunction() {
        stoppingFunction("paused");
        
        backgroundTime(liveIndex);
        updateIndexAndImage();
        return
    }

    //simplify a bit
    function updateIndexAndImage() {
        liveImage = getBackgroundURL(liveIndex)
        updateImage(currentImage, liveImage);
        currentIndex = liveIndex;
        currentImage = liveImage;
    }

    //when stop call this
    function stoppingFunction(log) {
        //pause and hide video
        videoLayer.pause();                  
        console.log(log);
        videoLayer.style.display = "none";

        //remove listeners
        clearInterval(playbackUpdateInterval)

        //add buttons
        pauseButton.disabled = false;
        weatherButton.disabled = true;
    }
}   





//const startInput = document.getElementById('startInput'); temporary start button
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', function() { //start animation on click
    const stopIndex = parseFloat(document.getElementById('stopIndex').value);

    if (currentIndex == stopIndex) return;
    easedVideo(currentIndex, stopIndex);
});



//weather stuff
//say 0 is clear and 1 is rain; initialise
let currentWeather = 0;

function weatherButtonFunction() {
    if (!currentWeather) {updateImage(currentImage, currentImage.slice(0,20) + "r" + currentImage.slice(20,100))}
    else {updateImage(currentImage.slice(0,20) + "r" + currentImage.slice(20,100), currentImage)}
    currentWeather = !currentWeather
    weatherButton.innerHTML = (currentWeather) ? "clear" : "rain";
    console.log(currentWeather, currentImage)
}

weatherSyncButton.addEventListener('click', getWeatherByLocation)

const openWeather = '2bff7b6c31dc3ae8697e2a77af6f3d76'; //don't steal this it's literally free to get one
function getWeatherByLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude: lat, longitude: lon } = pos.coords;
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeather}`);
            const data = await res.json();
            
            // Short-circuit evaluation: sets 1 if raining, 0 otherwise
            currentWeather = (data.weather?.[0]?.main === 'Rain' || data.rain) ? 1 : 0;
            
            console.log(`Current Weather Flag: ${currentWeather}`);
        } catch (err) {
            console.error("Failed to check weather:", err);
        }
    });
}






//simulated time for bg
function backgroundTime(arg) {
    const backgroundText = document.getElementById("bg-text")

    if (arg === undefined) {
        backgroundText.innerHTML = `simulated time: <br> syncing to sol-3...`
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





