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

        articles.forEach(post => {
            const articleFull = document.createElement("div");
            articleFull.innerHTML = `${post.content}`
            articleFull.className = "placeholder"
            articleFull.id = post.id; 
            articleFull.dataset.multipleWidth = post.width; 
            articleFull.dataset.date = post.date;

            const articleDate = new Date(post.date)
            const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            articleFull.innerHTML += `<span class="date">${articleDate.toLocaleDateString('en-GB', options)}</span>`
            articleContainer.append(articleFull)
        })

    } catch (error) {
        console.error(error);
    }
}

loadArticles()
setupMasonry()
window.addEventListener('load', setupMasonry);
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes