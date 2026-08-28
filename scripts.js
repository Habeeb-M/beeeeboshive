//CHANGE BACKGROUND WITH TIME
const bottomLayer = document.getElementById("bg-bottom")
const topLayer = document.getElementById("bg-top")
const videoLayer = document.getElementById("bg-video")
const desyncCheckbox = document.getElementById("desyncCheckbox")
const pauseButton = document.getElementById("pauseButton")
const weatherButton = document.getElementById("weatherButton")
const weatherSyncButton = document.getElementById("weatherSyncButton")
const pauseControls = document.getElementsByClassName("pauseControls")
var transitionSpeed = 500 //transition of bg layer
const updateInterval = 1000; //update every second  to check if bg needs to change.. can increase this

function getCurrentHour() {
    let date = new Date();
    return date.getHours();
}

function modulo(a,b) { return ((a % b) + b) % b }


//blinky title
const title = document.getElementById("titletext")
const titleLength = title.innerHTML.length-(93+6*ellipsisNumber)
const ellipsis = document.getElementsByClassName("hidden")
var ellipsisNumber = 0;

function blinkyEllipsis() {
    //console.log(ellipsisNumber)

    if (ellipsisNumber==3) {
        for (let dot of ellipsis) {dot.classList.remove("shown")}
    }
    else {
        ellipsis[ellipsisNumber].classList.add("shown")
    }

    ellipsisNumber = (ellipsisNumber + 1) % 4
}
setInterval(blinkyEllipsis, 500)




//////////////////////
// BACKGROUND STUFF //
//////////////////////

//change currentimage to nextimage
function updateImage(currentImage, nextImage) {
    if (nextImage != currentImage) {
        console.log(`changing ${currentImage} to ${nextImage}`)
        bottomLayer.style.backgroundImage = nextImage;
        topLayer.style.opacity = 0;

        setTimeout( function() { //after transition make top layer into bottom
            topLayer.style.backgroundImage = nextImage;
            topLayer.style.opacity = 1;
        }, transitionSpeed); 
    }
}


let currentImage = "";
let currentIndex = undefined;
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
let liveIndex = undefined;
let liveImage = "";
let doLoop = false;

function easedVideo(startIndex, stopIndex) {
    //background transition speed - set to 0 while playing
    transitionSpeed = 0
    for (let elem of document.getElementsByClassName('bg-layer')) {
        elem.style.transitionDelay = `${transitionSpeed}ms`
    }

    //loop flag and stuff
    if (stopIndex < startIndex) { 
        doLoop = true
        videoLayer.addEventListener('ended', loopFunction);
        function loopFunction() {
            videoLayer.play();
            doLoop = false;
            videoLayer.removeEventListener('ended', loopFunction)
        }
    }
    

    //index is 0-23, time is the time of the video
    const startTime = indexToTime(startIndex)
    const stopTime = indexToTime(stopIndex) 
    const totalTime = modulo(stopTime-startTime, 120);

    //set video, start time
    console.log("log", currentWeather)
    videoLayer.src = (currentWeather) ? 'img/background/rbg-video.mp4' : 'img/background/bg-video.mp4'
    videoLayer.currentTime = indexToTime(startIndex);
    videoLayer.addEventListener('ended', () => videoLayer.play()); //have to loop manually

    //buttons
    pauseButton.disabled = false;
    weatherButton.disabled = true;

    //unhide and play video
    videoLayer.style.display = "";
    videoLayer.play();


    //runs every 100ms, updates playbackrate, currentimage, background time, the checkplaying - stops when video does
    let playbackUpdateInterval = setInterval(playbackRateUpdate, 100); 
    function playbackRateUpdate() {
        //console.log(videoLayer.currentTime,easeFunction(modulo((videoLayer.currentTime-startTime)/totalTime,1),totalTime+1))
        //console.log(videoLayer.currentTime, inverseEase(videoLayer.currentTime, totalTime+1))

        videoLayer.playbackRate = easeFunction(modulo((videoLayer.currentTime-startTime)/totalTime,1), totalTime+1)

        if (doLoop == true || (stopTime - videoLayer.currentTime > 0.2 && doLoop == false)) {//near end
            liveIndex = Math.floor((videoLayer.currentTime)/5) % 24
            updateIndexAndImage();
        
            backgroundTime(inverseEase(videoLayer.currentTime))
        }

        checkPlaying()
    }

    //checks if video is supposed to end, or is resynced
    //deal with loops with a flag and desync properly TODO
    function checkPlaying() {
        if (!desyncCheckbox.checked) {//if resynced, reset time
            stoppingFunction("resynced")
            backgroundTime();
            backgroundUpdate()
            return
        }

        if (stopTime - videoLayer.currentTime <= 0.2 && doLoop == false) { //when stops naturally
            //update time to recent liveindex time and image instantly
            //also as it stops just before need to update manually
            liveIndex = stopIndex;
            backgroundTime(inverseEase(stopTime))        
            updateIndexAndImage();
            console.log("updated")
            setTimeout(() => stoppingFunction("stopped"), 20)
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

        //reset transition speed
        transitionSpeed = 0
        for (let elem of document.getElementsByClassName('bg-layer')) {
            elem.style.transitionDelay = `${transitionSpeed}ms`
        }
        transitionSpeed = 500;

        //remove listeners
        clearInterval(playbackUpdateInterval)

        //add buttons
        pauseButton.disabled = true;
        weatherButton.disabled = false;
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

function weatherButtonFunction(swapButton=true) {
    if (swapButton) { currentWeather = !currentWeather }
    
    if (currentWeather) {
        updateImage(currentImage, getBackgroundURL(currentIndex))
        currentImage = getBackgroundURL(currentIndex)
    }
    else {
        updateImage(currentImage, getBackgroundURL(currentIndex))
        currentImage = getBackgroundURL(currentIndex)
    }

    weatherButton.innerHTML = (currentWeather) ? "clear" : "rain";
}

weatherSyncButton.addEventListener('click', getWeatherByLocation)

const openWeather = '2bff7b6c31dc3ae8697e2a77af6f3d76'; //don't steal this it's literally free to get one
function getWeatherByLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { latitude: lat, longitude: lon } = pos.coords;
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeather}`);
            const data = await res.json();
            
            // sets 1 if raining, 0 otherwise
            currentWeather = (data.weather?.[0]?.main === 'Rain' || data.rain) ? 1 : 0;
            
            console.log(`${data.weather?.[0]?.main}`);
            weatherButtonFunction(false)

        } catch (error) {
            console.error(error);
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



/////////////////
// POSITIONING //
/////////////////


//position (can also put as bookmarklet)
//javascript:( function () { 
//    var box = document.getElementById('coord-tracker');
//    if (!box) { 
//        box=document.createElement('div');
//        box.id='coord-tracker';
//        box.style.position='fixed';
//        box.style.background='rgba(0,0,0,0.8)';
//        box.style.color='#fff';
//        box.style.fontSize='12px';
//        box.style.zIndex='999999';
//        document.body.appendChild(box);
//    }
//    document.onmousemove = function(e) { 
//        box.style.left = (e.clientX-15) + 'px';
//        box.style.top = (e.clientY+15) + 'px';
//        box.innerHTML= 'X: '+e.pageX+' | Y: '+e.pageY;
//    };
//})();



//post everything from frontPage.js (done in apiary.js now)
//now position it

//recreating css width for a proper masonry function, and the corresponding left coordinate
//220 is width of sidebar, 10 width of margin, 270 is max width. .232 seems to match the background resize
export function divWidth(x, multipleWidth) {  return Math.min(270, Math.max(220, 0.232*x+0))*multipleWidth + 10*(multipleWidth-1) } 
function divLeft(x) { return divWidth(window.innerWidth,1)*x + 10*x }

export function setupMasonry() {
    if (moveCheckbox.checked) { return }

    const container = document.querySelector('.container');
    const items = container.querySelectorAll('.container div');


    let masonColumn = -1
    let masonBottoms = []
    for (let item of items) {
        //for all the placed items, set their width according to windowsize and multiplewidth
        item.style.width = `${divWidth(window.innerWidth, parseInt(item.dataset.multipleWidth))}px`

        //for the first row, set their top and left, and set masonbottoms[masoncolumn] to the bottom. 
        //if multiple width make sure to skip columns and append to masonbottoms
        if (masonBottoms.length < 3) {
            
            masonColumn += 1
            item.style.left = `${divLeft(masonColumn)}px`;
            item.style.top = `${((masonBottoms[masonColumn]) ? masonBottoms[masonColumn] : 0)}px`
            masonBottoms[masonColumn] = item.offsetTop + item.offsetHeight

            for (let step = 1; step < item.dataset.multipleWidth; step++) {
                masonColumn += 1
                masonBottoms[masonColumn] = item.offsetTop + item.offsetHeight
            }
        }

        else { //after first three placed

            masonColumn = masonBottoms.indexOf(Math.min(...masonBottoms)) //find the minimum bottom's index and add to this column 
            let masonTop = `${5 + ((masonBottoms[masonColumn]) ? masonBottoms[masonColumn] : 0)}px`

            if (item.dataset.multipleWidth == 2) {//but if its multiplewidth it might overlap with an earlier element, so take the lower one
                if (masonBottoms[masonColumn+1] > masonBottoms[masonColumn]) {
                    //console.log("conflict!")
                    masonTop = `${5 + ((masonBottoms[masonColumn+1]) ? masonBottoms[masonColumn+1] : 0)}px`
                }

                if (masonColumn == 2) {//if it is in 3rd column then take the lower one from the first two
                    //console.log("double conflict")
                    masonColumn = masonBottoms.indexOf(Math.min(masonBottoms[0],masonBottoms[1]))
                    masonTop = `${5 + masonBottoms[masonColumn+1]}px`
                }
            }

            //console.log(masonColumn)
            item.style.left = `${divLeft(masonColumn)}px`; 
            item.style.top = masonTop;
            masonBottoms[masonColumn] = item.offsetTop + item.offsetHeight

            for (let step = 1; step < item.dataset.multipleWidth; step++) {//same multiplewidth check
                masonColumn += 1
                masonBottoms[masonColumn] = item.offsetTop + item.offsetHeight
            }
        }


        //console.log(item.dataset.id, masonBottoms)
    }
}

window.addEventListener('load', setupMasonry); //run on page load
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes


//function setupBorder() { //not used rn
//    const items = document.querySelectorAll('.border');
//
//    items.forEach(function(item) {
//        const borderCorner = document.createElement('img');
//        borderCorner.src = 'img/border2.png';
//        item.appendChild(borderCorner);
//
//        item.style.position = 'relative';
//        borderCorner.style.position = 'absolute';
//        borderCorner.style.bottom = '0px';
//        borderCorner.style.right = '0px';
//        borderCorner.style.width = "35%";
//        borderCorner.style.imageRendering = "pixelated";
//        borderCorner.style.opacity = "5%";
//        }
//    )
//}
//setupBorder()





/////////
// FUN //
/////////

//moveable boxe things
const moveCheckbox = document.getElementById("moveCheckbox")
var placeholderArray = undefined;
var prePositions = undefined;

//add the move controls
function moveFunction() {
    placeholderArray = Array.from(document.querySelectorAll(".placeholder"))

    if (moveCheckbox.checked) {
        prePositions = placeholderArray.map( element => {//get the positions before. do this before moving stuff
            return {
                left: element.getBoundingClientRect().left + window.scrollX,
                top: element.getBoundingClientRect().top + window.scrollY,
                width: parseFloat(window.getComputedStyle(element).width) - ((element.parentElement.classList.value=="container") ? (52) : (0)),
                parent: element.parentElement
            }
        })

        console.log(placeholderArray)

    
        placeholderArray.forEach((element, index) => {//now set to absolute(for moving) and set the positions absolutely
            element.style.position = "absolute";
            document.body.appendChild(element); 
            element.style.left = prePositions[index].left - 5 + "px" ;
            element.style.top = prePositions[index].top - 5 + "px";
            element.style.width = prePositions[index].width + "px";

            const moveControls = document.createElement("div")
            moveControls.innerHTML = "test";
            moveControls.className = "moveControls";
            moveControls.style.position = "absolute";
            element.append(moveControls);

            dragElement(moveControls);
        });
    }

    else {
        placeholderArray.forEach((element, index) => {//now set to relative(for masonry) and reset the positions
            element.querySelector(".moveControls").remove();

            prePositions[index].parent.appendChild(element); 
            element.style.position = "relative";
            element.style.position = "";
            element.style.left = "";
            element.style.top = "";
            element.style.width = "";
        });
        setupMasonry()
    }
}
document.getElementById('moveCheckbox').addEventListener('click', moveFunction);


//actual moving
function dragElement(elem) { 
    var startX = 0, startY = 0;
    var elemStartLeft = 0, elemStartTop = 0;
    
    elem.onmousedown = dragMouseDown; //run if start drag

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        
        //mouse and parent initial pos
        startX = e.clientX;
        startY = e.clientY;
        elemStartLeft = elem.parentElement.offsetLeft;
        elemStartTop = elem.parentElement.offsetTop;
        
        document.onmouseup = closeDragElement; //run if stop drag
        document.onmousemove = elementDrag; //run if move
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        var mouseMovedX = e.clientX - startX;
        var mouseMovedY = e.clientY - startY;
        
        elem.parentElement.style.left = (elemStartLeft + mouseMovedX) + "px";
        elem.parentElement.style.top = (elemStartTop + mouseMovedY) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}



//socials popup
const poppedupBoxes = [0, 0, 0]

function createPopup(input) {
    poppedupBoxes[input] = (poppedupBoxes[input]) ? 0 : 1; //updates which are on and off
    var boxID = ""; 
    var popupText = ""; 

    switch(input) {//html id
        case 0: boxID = "logoMail"; break; 
        case 1: boxID = "logoDiscord"; break; 
        case 2: boxID = "logoMinecraft"; break; 
    }
    const parentButton = document.getElementById(boxID); //get the button


    if (poppedupBoxes[input] == 1) {
        switch(input) {//actual text in the popup
            case 0: popupText = "figure out the cipher!<br>923663>@92>>65a__do8>2:=]4@>"; break; 
            case 1: popupText = "@habeebm"; break; 
            case 2: popupText = "rustikmagma"; break; 
        }

        const arrowUp = document.createElement("div");
        arrowUp.classList = `arrowUp`;
        const popupBox = document.createElement("span");
        popupBox.innerHTML = popupText;
        popupBox.classList = `popupBox`;

        const popupWrapper = document.createElement("div");
        popupWrapper.id = `popupWrapper${input}`
        popupWrapper.classList = `popupWrapper`;
        popupWrapper.append(arrowUp, popupBox)
        parentButton.append(popupWrapper)

        popupWrapper.style.visibility = "hidden"; //add it early and hide it so i can get the width
        const parentRect = parentButton.getBoundingClientRect();
        const popupRect = popupWrapper.getBoundingClientRect();
        popupWrapper.style.left = `${parentRect.left + parentRect.width/2 - popupRect.width/2}px`
        popupWrapper.style.top = `${parentRect.top+window.scrollY + 18}px`

        //offscreen check
        if (parentRect.left + parentRect.width/2 - popupRect.width/2 < 0) { popupBox.style.transform = `translateX(${74}px)` }
        popupWrapper.style.visibility = "";
        popupWrapper.style.clipPath = "circle(120% at 50% 50%)";
        
    }

    else if (poppedupBoxes[input] === 0) {
        const popupWrapper = parentButton.querySelector(`#popupWrapper${input}`)
        popupWrapper.style.clipPath = "circle(0% at 50% 50%)";
        setTimeout(() => popupWrapper.remove(), 500); //match the transition duration in css
    }
}
document.getElementById('logoMail').addEventListener('click', () => createPopup(0));
document.getElementById('logoDiscord').addEventListener('click', () => createPopup(1));
document.getElementById('logoMinecraft').addEventListener('click', () => createPopup(2));





//pollen emitter and bee.. create canvas
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 4000; //err this needs to b height of page but the comments section loads slowly...
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

//particle and bee constructor
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2; 
        this.speedY = Math.random() + 0.3; 
        this.speedX = (Math.random() - 0.5) * 1;
        this.age = 0;
        this.death = Math.random()*500;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.age += 1;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 0)`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

class Bee {
    constructor() {
        this.x = 2000;
        this.y = 100;
    }

    update(speedX, speedY) {
        this.x += speedX;
        this.y += speedY;
    }

    draw() {
         ctx.drawImage(playerImg, this.x, this.y, 20, 20);
    }
}


//follow mouse position and window focus
let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX + window.scrollX;
    mouse.y = e.clientY + window.scrollY;
});



//create pollen and bee
var spawnInterval = setInterval(() => { createParticle(mouse.x, mouse.y); }, 1000);
window.onfocus = function() {
    if (!spawnInterval) {spawnInterval = setInterval(() => { createParticle(mouse.x, mouse.y); }, 1000);}
};
window.onblur = function() {
    clearInterval(spawnInterval)
    spawnInterval = null;
};


function createParticle(x, y) {
    particles.push(new Particle(x, y));
}

const playerImg = new Image();
playerImg.src = './img/bee.png';
const beeOne = new Bee();
ctx.imageSmoothingEnabled = false;



//animate pollen n bee
const particles = [];
var targetPollenIndex = 0;
var pseudotime = 0;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //remove old one 
    pseudotime += 1

    for (let i = particles.length - 1; i >= 0; i--) {//update to get ne wones
        particles[i].update();
        particles[i].draw();

        if (targetPollenIndex===undefined) {
            if (particles[targetPollenIndex].age > particles[targetPollenIndex].death) {//kill target if old and switch
                particles.splice(targetPollenIndex, 1);
                targetPollenIndex = Math.floor(Math.random()*particles.length);
            }
        }

        if (particles[i].age > particles[i].death) {//kill other old ones
            particles.splice(i, 1);
        }
    }

    beeOne.draw()

    //make bee go to some pollen
    if (particles[targetPollenIndex]) {
        //console.log(targetPollen)
        const distanceVector = {x: particles[targetPollenIndex].x-beeOne.x, 
                                y: particles[targetPollenIndex].y-beeOne.y, 
                                dist: Math.sqrt((particles[targetPollenIndex].x-beeOne.x)**2+(particles[targetPollenIndex].y-beeOne.y)**2)/4} //speed
        
        if (distanceVector.dist > 5) {
            beeOne.update(distanceVector.x/distanceVector.dist, distanceVector.y/distanceVector.dist + 2*Math.sin(pseudotime/3))
        }
        else {
            beeOne.update(0, 3*Math.sin(pseudotime/10))
        }
    }

    requestAnimationFrame(animate); //animate canvas 
}
animate();