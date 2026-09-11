// ARTICLES
import { setupMasonry } from './scripts.js'
const articleContainer = document.getElementsByClassName("container")[0]

async function loadArticles() {
    try {
        const response = await fetch('./orchard.json');
        
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


