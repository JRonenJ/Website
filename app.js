// Run this function automatically when the webpage open
document.addEventListener("DOMContentLoaded", () => {
  fetchContent();
});

// Grab the data from our JSON "database"
async function fetchContent() {
  try {
    const response = await fetch("content.json");
    const data = await response.json();
    renderWebsite(data);
  } catch (error) {
    console.error("Error pulling article content:", error);
  }
}

// Assemble the components onto the page
function renderWebsite(articles) {
  const feedContainer = document.getElementById("dynamic-feed");
  feedContainer.innerHTML = ""; // Clear temporary text

  articles.forEach((article) => {
    // Create an empty card container
    const card = document.createElement("div");
    card.className = "card";

    // Check if item contains a score rating (for reviews)
    const scoreBadge = article.score
      ? `<span class="score">⭐ ${article.score}</span>`
      : "";

    // Build the HTML component template
    card.innerHTML = `
            <span class="badge">${article.category}</span>
            ${scoreBadge}
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <small>Published on: ${article.date}</small>
        `;

    // Inject the card directly onto the homepage
    feedContainer.appendChild(card);
  });
}
