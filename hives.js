// ARTICLES
import { setupMasonry } from './scripts.js'
const articleContainer = document.getElementsByClassName("container")[0]

async function loadArticles() {
    try {
        const response = await fetch('./hives.json');
        
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`);
        }
        
        const articles = await response.json();

        articles.sort((a, b) => b.number-a.number);
        articles.forEach(post => {
            const articleFull = document.createElement("div");
            articleFull.innerHTML = post.content.join("");
            articleFull.className = "placeholder"
            articleFull.id = post.id; 
            articleFull.dataset.multipleWidth = post.width; 
            articleFull.dataset.date = post.date;
            articleFull.dataset.author = post.author;
            articleFull.dataset.title = post.title;

            articleFull.innerHTML = `<span class="articleTitle">${post.title}</span>` + "<br><br>" + articleFull.innerHTML;

            //add a hidden line to increase padding naturally, and add date/author, wordcount
            const articleDate = new Date(post.date)
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

            const totalWords = post.content.flatMap(str => { //regex word counter but removing html tags
                const cleanStr = str.replace(/<[^>]*>/g, ' ');
                const words = cleanStr.match(/[a-zA-Z0-9]+(?:['’-][a-zA-Z0-9]+)*/g) || [];
                return words;
            }).length;      

            articleFull.innerHTML += `<br><br><span class="hidden">g</span> <span class="date">—${post.author}, ${articleDate.toLocaleDateString('en-GB', options)}<br>(${totalWords} words)</span>`
            articleContainer.append(articleFull)

            //add number
            articleFull.innerHTML += `<span class="hiveNumber">#${post.number+1}</span>`
        })


        //spotify
        const spotifyIFrames = document.querySelectorAll(".spotifyIFrame")
        for (const spotifySpan of spotifyIFrames) {
            spotifySpan.innerHTML += `<h1>${spotifySpan.dataset.song}</h1>`
            spotifySpan.innerHTML += `<h2>${spotifySpan.dataset.artist}</h2>`
            spotifySpan.innerHTML += "<span>click me to load!</span>";
            spotifySpan.style.cursor = "pointer";
            spotifySpan.style.backgroundColor = '#' + spotifySpan.dataset.colour;

            //if clicked then load the iframe
            spotifySpan.addEventListener('click', () => {
                spotifySpan.innerHTML = `<iframe data-testid="embed-iframe" src="https://open.spotify.com/embed/track/${spotifySpan.dataset.url}?utm_source=generator" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
            })
        }


        //youtube
        const youtubeIFrames = document.querySelectorAll(".youtubeIFrame")
        for (const youtubeSpan of youtubeIFrames) {
            youtubeSpan.innerHTML += `<h1>${youtubeSpan.dataset.song}</h1>`
            youtubeSpan.innerHTML += `<h2>${youtubeSpan.dataset.channel}</h2><br>`
            youtubeSpan.innerHTML += "<span>click me to load youtube embed!</span>"

            youtubeSpan.addEventListener('click', () => {
                youtubeSpan.innerHTML = `<iframe src=\"https://www.youtube.com/embed/${youtubeSpan.dataset.url}\" width=\"100%\" height=\"100%\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>`
            })
        }

        //arrange
        setupMasonry()

        //scroll to post
        const hash = window.location.hash.slice(1,100)-1;
        if (hash) {
          const targetElement = document.getElementById(hash); 
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }

    } catch (error) {
        console.error(error);
    }
}

loadArticles()
window.addEventListener('load', setupMasonry);
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes




//spotify playlist
const playlistAuthor = document.querySelector(".Marquee_inner__UKCZf")
console.log(playlistAuthor)
playlistAuthor.innerHTML = "hi"