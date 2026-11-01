let allItems = [];
let currentCategory = 'all';

document.addEventListener("DOMContentLoaded", () => {
    fetchContent();
    setupTabListeners();
    setupSearchListener();
    setupThemeToggle();
    setupModalCloseListener();
});

async function fetchContent() {
    try {
        const response = await fetch('content.json');
        allItems = await response.json();
        
        // 1. Render Top Layout Elements
        renderHeroGrid();
        
        // 2. Extract and display Sponsor advertisements
        const sponsorItems = allItems.filter(item => item.isSponsor === true);
        renderSponsors(sponsorItems);

        // 3. Populate Main Timeline Stream
        filterAndRender();
    } catch (error) {
        console.error("Error running application render sync:", error);
    }
}

function renderHeroGrid() {
    const mainContainer = document.getElementById('hero-main-spotlight');
    const centerStack = document.getElementById('hero-center-stack');
    const rightTimeline = document.getElementById('timeline-scroll-box');
    
    if(!mainContainer || !centerStack || !rightTimeline) return;

    // Filter organic content out from advertisements 
    const operationalStories = allItems.filter(item => !item.isSponsor);

    // 1. Pull the targeted single main top story
    const mainStory = operationalStories.find(item => item.featured === true) || operationalStories[0];
    
    // 2. Select two stories for the middle layout column (excluding the main story)
    const centerStories = operationalStories.filter(item => item.id !== mainStory.id).slice(0, 2);
    
    // 3. Select subsequent chronological news segments for the right timeline stream 
    const timelineStories = operationalStories.filter(item => item.id !== mainStory.id && !centerStories.includes(item)).slice(0, 4);

    // Render Left Feature Item Component
    if (mainStory) {
        const scoreBadge = mainStory.score ? `<span class="score-badge">⭐ ${mainStory.score}</span>` : '';
        mainContainer.innerHTML = `
            <div class="hybrid-main-card" onclick="openArticleModal(${mainStory.id})">
                <div>
                    <span class="badge">${mainStory.category}</span>
                    ${scoreBadge}
                </div>
                <h2>${mainStory.title}</h2>
                <p>${mainStory.excerpt}</p>
                <small>📅 Published: ${mainStory.date}</small>
            </div>
        `;
    }

    // Render Center Stack Split Elements Block
    centerStack.innerHTML = '';
    centerStories.forEach(story => {
        const scoreBadge = story.score ? `<span class="score-badge">⭐ ${story.score}</span>` : '';
        centerStack.innerHTML += `
            <div class="hybrid-center-card" onclick="openArticleModal(${story.id})">
                <div>
                    <span class="badge">${story.category}</span>
                    ${scoreBadge}
                    <h3>${story.title}</h3>
                </div>
                <small>📅 ${story.date}</small>
            </div>
        `;
    });

    // Render Right Compact Scannable List Layout Flow
    rightTimeline.innerHTML = '';
    timelineStories.forEach(story => {
        rightTimeline.innerHTML += `
            <div class="timeline-row-item" onclick="openArticleModal(${story.id})">
                <span class="time-stamp">⚡ ${story.category}</span>
                <h4>${story.title}</h4>
            </div>
        `;
    });
}
function filterAndRender() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    const filtered = allItems.filter(item => {
        if (item.isSponsor) return false; // Hide ads from layout line stream

        const matchesCategory = (currentCategory === 'all' || item.category === currentCategory);
        const matchesSearch = item.title.toLowerCase().includes(searchQuery) || 
                              item.excerpt.toLowerCase().includes(searchQuery);

        return matchesCategory && matchesSearch;
    });

    renderFeed(filtered);
}

function renderFeed(articles) {
    const feedContainer = document.getElementById('dynamic-feed');
    feedContainer.innerHTML = '';

    if (articles.length === 0) {
        feedContainer.innerHTML = '<p class="no-content">No gaming entries match your criteria.</p>';
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card review-list-card';
        card.style.cursor = 'pointer';
        card.setAttribute('onclick', `openArticleModal(${article.id})`);
        
        // 🎯 UPGRADED STRUCTURAL SCORE BADGE
        const scoreBadge = article.score ? `<span class="homepage-score-box">🏆 ${article.score}</span>` : '';

        card.innerHTML = `
            <div class="card-header-row">
                <span class="badge">${article.category}</span>
                ${scoreBadge}
            </div>
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <small>📅 Published: ${article.date}</small>
        `;
        feedContainer.appendChild(card);
    });
}


// 👁️ MODAL CONTROLLER FUNCTIONS 👁️
window.openArticleModal = function(id) {
    const article = allItems.find(item => item.id === id);
    if (!article) return;

    document.getElementById('modal-title').textContent = article.title;
    document.getElementById('modal-category').textContent = article.category;
    document.getElementById('modal-date').textContent = `Published on: ${article.date}`;
    
    // Inject the deep structural reading text block (fall back to excerpt if blank)
    document.getElementById('modal-body').textContent = article.fullReview || article.excerpt;

    const scoreWrap = document.getElementById('modal-score-wrap');
    if (article.score) {
        scoreWrap.innerHTML = `<span class="score-badge" style="font-size:1.1rem; padding: 6px 12px;">Final Score: ⭐ ${article.score}</span>`;
    } else {
        scoreWrap.innerHTML = '';
    }

    // Toggle the display mode configuration class structure from none -> flex
    document.getElementById('review-modal').style.display = 'flex';
};

function setupModalCloseListener() {
    const modal = document.getElementById('review-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    // Close when clicking the "X" button icon
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close automatically if the reader clicks out in the dark blurred zone spaces
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// (Keep your existing setups unchanged below)
function renderSponsors(sponsors) {
    const sponsorSpot = document.getElementById('sponsor-spot');
    if (!sponsorSpot || sponsors.length === 0) return;
    const ad = sponsors[0];
    sponsorSpot.innerHTML = `
        <div class="ethical-ad-box">
            <h4>${ad.title}</h4>
            <p>${ad.excerpt}</p>
            <a href="${ad.link}" target="_blank" class="ad-link-btn">Check Out Indie Game</a>
        </div>
    `;
}

function setupTabListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            filterAndRender();
        });
    });
}

function setupSearchListener() {
    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndRender();
        });
    }
}

function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if(!themeBtn) return;
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            themeBtn.textContent = "🌙 Dark Mode";
        } else {
            themeBtn.textContent = "☀️ Light Mode";
        }
    });
}


