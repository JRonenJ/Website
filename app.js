// Global storage to hold data after fetching it
let allArticles = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchContent();
    setupTabListeners();
});

async function fetchContent() {
    try {
        const response = await fetch('content.json');
        allArticles = await response.json();
        // Initially render everything
        renderWebsite(allArticles); 
    } catch (error) {
        console.error("Error pulling article content:", error);
        document.getElementById('dynamic-feed').innerHTML = '<p>Could not load articles. Check back soon!</p>';
    }
}

function renderWebsite(articlesToDisplay) {
    const feedContainer = document.getElementById('dynamic-feed');
    feedContainer.innerHTML = ''; // Wipe current screen entries clean

    if (articlesToDisplay.length === 0) {
        feedContainer.innerHTML = '<p class="no-content">No articles found in this category yet.</p>';
        return;
    }

    articlesToDisplay.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';

        const scoreBadge = article.score ? `<span class="score-badge">⭐ Rating: ${article.score}</span>` : '';

        card.innerHTML = `
            <span class="badge">${article.category}</span>
            ${scoreBadge}
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <small>📅 ${article.date}</small>
        `;
        feedContainer.appendChild(card);
    });
}

function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove 'active' styling from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add 'active' styling to the clicked tab
            e.target.classList.add('active');

            const selectedCategory = e.target.getAttribute('data-category');

            if (selectedCategory === 'all') {
                renderWebsite(allArticles); // Show everything
            } else {
                // Filter down arrays using JavaScript logic
                const filteredList = allArticles.filter(item => item.category === selectedCategory);
                renderWebsite(filteredList);
            }
        });
    });
}
