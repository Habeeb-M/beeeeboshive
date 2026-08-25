// FUN STUFF

//create masonry divs
//now doing with json. move honeyfun call and time update call and spotify call into this
import { setupMasonry } from './scripts.js'
const articleContainer = document.getElementsByClassName("container")[0]

async function loadArticles() {
    try {
        const response = await fetch('./apiary.json');
        
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`);
        }
        
        const articles = await response.json();

        articles.sort((a, b) => a.number - b.number);
        articles.forEach(post => {
            const articleFull = document.createElement("div");
            articleFull.innerHTML = post.content.join("");
            articleFull.className = "placeholder"
            articleFull.id = post.id; 
            articleFull.dataset.multipleWidth = post.width; 
            
            articleContainer.append(articleFull)
        })

        //honey call
        honeyFun()
        setInterval(honeyFun, 60000);

        //time update call
        window.addEventListener('load', () => {
            document.getElementById('funTime').style.display = "none";
            updateTime()
            setInterval(updateTime, 1000);
        });

        //spotify call
        updateSpotify();
        setTimeout(setupMasonry, 1000)

        setInterval(() => {
            updateSpotify();
            setTimeout(setupMasonry, 1000)
        }, 60000);

        setupMasonry()


    } catch (error) {
        console.error(error);
    }
}

loadArticles()
window.addEventListener('load', setupMasonry);
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes



//spotify
export const updateSpotify = async () => {
  try {
    const response = await fetch("https://beeeeboshive.beeeeboshive.workers.dev/");
    const data = await response.json();

    var artistList = "";
    for (let artist of data.artists) {
        artistList += `<a href="${artist.url}">${artist.name}</a>` + `, `
    }
    artistList = artistList.slice(0,artistList.length-2)
    //console.log(data)

    const releaseYear = new Date(data.releaseDate)

    document.getElementById("spotifyPlaying").innerHTML = (data.isPlaying) ? ("now playing... ") : ("last played... ")
    document.getElementById("spotifySong").innerHTML = `<a href="${data.songUrl}">${data.title}</a>`
    document.getElementById("spotifyArtist").innerHTML = artistList
    document.getElementById("spotifyAlbum").innerHTML = `<a href="${data.albumUrl}">${data.albumTitle}</a>`
    document.getElementById("spotifyDate").innerHTML = `(${releaseYear.getFullYear()})`;
    document.getElementById("spotifyImage").style.width = `120px`;
    document.getElementById("spotifyImage").src = data.albumImageUrl
    
    
    return;
  } catch (error) {
    console.error("spotify borken", error.message);
  }
};





//chat
const comments = document.getElementById("comments")
comments.setAttribute("width", `${divWidth(window.innerWidth, 2)-50}px`);


//run this on site load, fills in funny splash text and stuff
function honeyFun() {
    let now = new Date();

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
    let currentDayRounded = Math.round(currentDay+0.5);
    let funExplorationArea = [" patch", " grove", " field", "n orchard", " pasture", " thicket", " meadow", " garden", "n oasis"]
    let rng1 = mulberry32(currentDayRounded+0.5)*(funExplorationArea.length-1)
    //console.log(mulberry32(currentDayRounded))


    let funExplorationFloraSpring = ["tulips", "forget-me-nots", "primroses", "bluebells", "almond trees", "redflower currants", "alliums", 
        "willow trees", "plum trees",
    ]
    let funExplorationFloraSummer = ["marigolds", "lavender", "cornflowers", "borage", "heather", "wisteria", "sunflowers", "psycho linden trees"
    ]
    let funExplorationFloraAutumn = ["apple trees", "ivy", "goldenrods", "blue orchids", "daisies", "dahlias", "salvias", "quince trees"
    ]
    let funExplorationFloraWinter = ["christmas cacti", "sedum", "jasmine", "snowdrops", "pansies", "mahonia", "honeysuckles",
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
    let funResearch = ["tougher comb structures are being researched...",
        "packing algorithms are being optimised...",
        "denser honey is being developed...",
        "sweeter honey is being developed...",
        "stingers are being sharpened...",
        "stickier setae are being tested...",
        "water resistant fuzz is being tested...",
        "a periodic comb tiling has been discovered...",
        "soil tests have been sent to the lab..."
    ]
    let rng3 = mulberry32(rng2)*(funResearch.length-1)

    //honey splash 6 - status
    let funStatus = ["hive repairs are underway...",
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




//pseudoRNG with a seed
function mulberry32(mySeed) {
    let t = mySeed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}



//time
function updateTime() {
            let now = new Date();
            const options = { hour: 'numeric', minute: '2-digit', hour12: false };
            document.getElementById("funCurrentTime").innerHTML = now.toLocaleTimeString([], options);
        }
        



