// ARTICLES
import { articles } from './articles.js'
import { setupMasonry } from './scripts.js'

const articleContainer = document.getElementsByClassName("container")[0]
articles.forEach(post => {
        const articleFull = document.createElement("div");
        articleFull.innerHTML = `${post.content}`
        articleFull.className = "placeholder"
        articleFull.dataset.id = post.id; 
        articleFull.dataset.multipleWidth = post.width; 
        articleContainer.append(articleFull)
    })

setupMasonry()
window.addEventListener('load', setupMasonry);
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes