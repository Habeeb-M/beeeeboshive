const articleContainer = document.getElementById("articleContainer")

// ARTICLES
import { articles } from './articles.js'

articles.forEach(post => {
    const articleFull = document.createElement("div");
    articleFull.innerHTML = `${post.content}`
    console.log(`${post.content}`)
    articleContainer.append(articleFull)
})