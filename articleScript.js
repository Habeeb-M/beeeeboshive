const articleContainer = document.getElementsByClassName("container")[0]

// ARTICLES
import { articles } from './articles.js'
import { setupMasonry } from './scripts.js'



articles.forEach(post => {
    const articleFull = document.createElement("div");
    articleFull.innerHTML = `${post.content}`
    articleFull.className = "placeholder triple-width"
    console.log(`${post.content}`)
    articleContainer.append(articleFull)
})

setupMasonry()
window.addEventListener('resize', setupMasonry); //recalculates masonry if window size changes