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

    let nextImage = `url('img/${currentIndex}.png')`;
    updateImage(currentImage, nextImage)
    currentImage = nextImage //update currentimage
}
let backgroundUpdateInterval = setInterval(backgroundUpdate, updateInterval); //and run this every updateinterval




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

    if (stopInput < startInput) {
        stopInput += indexToTime(24)
    }

    videoLayer.style.display = "";
    const N = 40; //amount of updates of playback speed
    const totalTime = stopInput - startInput;
    const dt = totalTime/N;

    videoLayer.play();
    console.log(startInput, "to", stopInput)

    videoLayer.addEventListener('timeupdate', checkPlaying); //while playing, check if stopped 
    function checkPlaying() {

        if (stopInput - videoLayer.currentTime <= buffer) {//just before end, update background  
            currentImage = `url('img/${currentIndex}.png')`;
            endImage = `url('img/${endIndex}.png')`; //update background when done
            updateImage(currentImage, endImage)
            currentIndex = endIndex
        }


        if (videoLayer.currentTime >= stopInput || !pauseCheckbox.checked) { //when stops or paused
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

//ffmpeg -i test.mp4 -vf "drawtext=text='%{pts\:hms}':x=10:y=10:fontsize=24:fontcolor=white" -frame_pts 1 frame_%d.png
function indexToTime(x) { //now just record a loop of 2 days. dont have to deal with wrapping it around the end of the video
    const start = 3.8;
    const end = 243.8;
    return x*(end-start)/48 + start;
}


sendButton.addEventListener('click', function() { //start animation
    if (currentIndex == stopInput.value) return;

    console.log(currentIndex, stopInput.value, indexToTime(currentIndex), indexToTime(stopInput.value), stopInput.value)
    easedVideo(indexToTime(currentIndex), indexToTime(stopInput.value), stopInput.value);
    //console.log(currentIndex, stopInput.value)
});



// FUN STUFF
let now = new Date();


//home page
function updateTime() {
            let now = new Date();
            const options = { hour: 'numeric', minute: '2-digit', hour12: false };
            document.getElementById("funCurrentTime").innerHTML = now.toLocaleTimeString([], options);
        }
        
updateTime(); //run on page load and update every second - could optimise to every minute
setInterval(updateTime, 1000);



//run this on site load, fills in funny splash text and stuff
function honeyFun() {

    //honey production %
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const currentDay = (now - startOfYear) / (24 * 60 * 60 * 1000); //1 is a day, goes up to 365
    //console.log(currentDay, honeyProductionValue(currentDay))

    function sunExposure(x) {
        return -(Math.sin(2*Math.PI*x+1.64)-0.56*Math.sin(2*Math.PI*x/365 - 7.72));
    }
    function honeyProductionValue(x) {
        return Math.round(500*(1+Math.sin(2*Math.PI*x/365 + 9/2))*Math.max(0, sunExposure(x)))/10;
    }
    document.getElementById("funCurrentHoney").innerHTML = honeyProductionValue(currentDay);



    // honey splash 1 - time
    function sunriseTime(x) { return 0.1*Math.sin(2*Math.PI*x/365.3 + 1.61) + 0.19 }
    function sunsetTime(x) { return 0.1*Math.sin(2*Math.PI*x/365.3 - 1.32) + 0.79 }
    const currentTime = currentDay - Math.trunc(currentDay)

    let honeySplash = "";
    let honeySplashSeason = "";
    //console.log(currentTime, sunriseTime(currentDay), sunsetTime(currentDay))
    
    if (sunriseTime(currentDay) - 0.05 < currentTime && currentTime <= sunriseTime(currentDay)) {
        honeySplash = "bees are waking up!";
    }
    else if (sunriseTime(currentDay) < currentTime && currentTime <= sunsetTime(currentDay) - 0.05) {
        honeySplash = "bees are out pollinating!";
    }
    else if (sunsetTime(currentDay) - 0.05 < currentTime && currentTime <= sunsetTime(currentDay) + 0.05 ) {
        honeySplash = "bees are returning home!";
    }
    else{
        honeySplash = "bees are resting!";
    }



    //honey splash 3 - area
    currentDayRounded = Math.round(currentDay+0.5);
    funExplorationArea = [" patch", " grove", " field", "n orchard", " pasture", " thicket", " meadow", " garden", " oasis"]
    let rng1 = mulberry32(currentDayRounded)*(funExplorationArea.length-1)
    //console.log(mulberry32(currentDayRounded))


    funExplorationFloraSpring = ["tulips", "forget-me-nots", "primroses", "bluebells", "almond trees", "redflower currants", "alliums", 
        "willow trees", "plum trees",
    ]
    funExplorationFloraSummer = ["marigolds", "lavender", "cornflowers", "borage", "heather", "wisteria", "sunflowers", "crabapple trees", "linden trees"
    ]
    funExplorationFloraAutumn = ["apple trees", "ivy", "goldenrods", "blue orchids", "daisies", "dahlias", "salvias", "quince trees"
    ]
    funExplorationFloraWinter = ["christmas cacti", "sedum", "jasmine", "snowdrops", "pansies", "mahonia", "honeysuckles",
    ]


    // honey splash 2, 4 - season and flowers
    let rng2 = mulberry32(rng1)
    let flower = ""
    if (60 <= currentDay && currentDay <= 151) { 
        honeySplashSeason = "larvae production is ramping up for spring!";

        rng2 = rng2*(funExplorationFloraSpring.length-1)
        flower = funExplorationFloraSpring[Math.round(rng2)];
    }
    else if (152 <= currentDay && currentDay <= 243) { 
        honeySplashSeason = "bees are out pollinating for summer!";

        rng2 = rng2*(funExplorationFloraSummer.length-1)
        flower = funExplorationFloraSummer[Math.round(rng2)];
    }
    else if (244 <= currentDay && currentDay <= 334) { 
        honeySplashSeason = "bees are slowing down for autumn!";

        rng2 = rng2*(funExplorationFloraAutumn.length-1)
        flower = funExplorationFloraAutumn[Math.round(rng2)];
    }
    else { 
        honeySplashSeason = "bees are conserving their energy for winter!"

        rng2 = rng2*(funExplorationFloraWinter.length-1)
        flower = funExplorationFloraWinter[Math.round(rng2)];
    }



    //honey splash 5 - research
    funResearch = ["tougher comb structures are being researched...",
        "packing algorithms are being optimised...",
        "denser honey is being developed...",
        "sweeter honey is being developed...",
        "stingers are being sharpened...",
        "stickier setae are being tested...",
        "water resistant fuzz is being tested...",
        "a periodic tiling has been discovered...",
        "soil tests have been sent to the lab..."
    ]
    let rng3 = mulberry32(rng2)*(funResearch.length-1)

    //honey splash 6 - status
    funStatus = ["hive repairs are underway...",
        "honey leakages are being patched...",
        "queen is on break.",
        "planning permission for a hive extension has been mailed off...",
        "a patch of moss is growing on the hive...",
        "polypore spores are in the air...",
    ]
    let rng4 = mulberry32(rng3)*(funStatus.length-1)

    //console.log(rng1,rng2,rng3,rng4)
    document.getElementById("funHoneySplash").innerHTML = honeySplash;
    document.getElementById("funHoneySplashSeason").innerHTML = honeySplashSeason;
    document.getElementById("funExplorationArea").innerHTML = funExplorationArea[Math.round(rng1)];
    document.getElementById("funExplorationFlora").innerHTML = flower;
    document.getElementById("funResearch").innerHTML = funResearch[Math.round(rng3)];
    document.getElementById("funStatus").innerHTML = funStatus[Math.round(rng4)];
}
honeyFun()   



//pseudoRNG with a seed
function mulberry32(mySeed) {
    let t = mySeed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}


//sets up the masonry front page
function setupMasonry() {
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


function setupBorder() { //looks pretty bad
    const items = document.querySelectorAll('.border');

    items.forEach(function(item) {
        const borderCorner = document.createElement('img');
        borderCorner.src = 'img/bordercorner.png';
        item.appendChild(borderCorner);

        item.style.position = 'relative';
        borderCorner.style.position = 'absolute';
        borderCorner.style.top = '1px';
        borderCorner.style.left = '1px';
        borderCorner.style.width = "10%";
        borderCorner.style.imageRendering = "pixelated";
        }
    )
}
setupBorder()
