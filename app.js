let allItems = [];
let currentCategory = 'all';

document.addEventListener("DOMContentLoaded", () => {
    // 🎯 CHECK IF THE USER IS ON THE ARTICLE PAGE
    if (window.location.pathname.includes("hollow-knight-article.html")) {
        loadFullArticlePage(); // If yes, only run the article loading code
        setupCommentEngine();
    } else {
        // If no (they are on the home page), run the standard home page setup
        fetchContent();
        setupTabListeners();
        setupSearchListener();
        setupNewsletterForm();
    }
    setupThemeToggle(); // This runs on both pages perfectly
});


async function fetchContent() {
    try {
        const response = await fetch('content.json');
        allItems = await response.json();
        
        // 1. Render upper spotlights
        renderHeroGrid();
        
        // 2. Separate and process ads
        const sponsorItems = allItems.filter(item => item.isSponsor === true);
        renderSponsors(sponsorItems);

        // 3. Process Lower Content Channels
        filterAndRender();
    } catch (error) {
        console.error("Critical layout processing error:", error);
    }
}

function filterAndRender() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    // 🎯 FILTER BASELIST: Filter out advertisements up-front
    const organicItems = allItems.filter(item => !item.isSponsor);

    // Split items into their respective categorical data buckets
    const reviewsOnly = organicItems.filter(item => item.category === "Review");
    const tipsOnly = organicItems.filter(item => item.category === "Tips");

    // Apply active search parameters smoothly if text exists
    const searchFilter = (list) => list.filter(item => 
        item.title.toLowerCase().includes(searchQuery) || item.excerpt.toLowerCase().includes(searchQuery)
    );

    // Limit output arrays strictly to 4 blocks (2 top, 2 bottom)
    renderTargetGrid(searchFilter(reviewsOnly).slice(0, 4), 'reviews-grid');
    renderTargetGrid(searchFilter(tipsOnly).slice(0, 4), 'tips-grid');
}

function renderHeroGrid() {
    const mainContainer = document.getElementById('hero-main-spotlight');
    const centerStack = document.getElementById('dynamic-center-news-cards'); // 🎯 Targeted sub-container
    const rightTimeline = document.getElementById('timeline-scroll-box');
    
    if(!mainContainer || !centerStack || !rightTimeline) return;

    // 🟢 RESTORE THIS TO NORMAL: Remove the archive blocker from the base list
    const editorialStories = allItems.filter(item => item.isSponsor !== true);


    // 1. Pull the targeted single main top feature story
    const mainStory = editorialStories.find(item => item.featured === true) || editorialStories[0];
    
    // 2. Select the next editorial stories cleanly for the middle column loop
    const centerStories = editorialStories.filter(item => item.id !== mainStory.id).slice(0, 2);
    // 🎯 TARGETED FIX FOR RIGHT COLUMN: Filter out items marked with hideFromRoundup
    const timelineStories = editorialStories.filter(item => {
        const isNotMain = item.id !== mainStory.id;
        const isNotCenter = !centerStories.includes(item);
        const isNotSponsorCategory = item.category !== "Sponsor";
        const isNotHiddenFromRoundup = item.hideFromRoundup !== true; // 👈 BLOCKS IT ONLY HERE

    return isNotMain && isNotCenter && isNotSponsorCategory && isNotHiddenFromRoundup;
}).slice(0, 4);

    // Render Left Feature Spotlight Card
    if (mainStory) {
        const scoreBadge = mainStory.score ? `<span class="score-badge">⭐ ${mainStory.score}</span>` : '';
        const bgStyle = mainStory.backgroundImage 
        ? `style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(11, 15, 25, 0.95) 100%), url('${mainStory.backgroundImage}'); background-size: cover; background-position: center;"`
        : '';
        mainContainer.innerHTML = `
        <div class="hybrid-main-card" ${bgStyle} onclick="openArticleModal(${mainStory.id})">
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

    // Render Center Stack Stories underneath the fixed ad panel card
    centerStack.innerHTML = '';
centerStories.forEach(story => {
    const scoreBadge = story.score ? `<span class="score-badge">⭐ ${story.score}</span>` : '';
    
    // 🎯 SMART BACKGROUND PHOTO CONTROLLER FOR MIDDLE CARDS:
    const bgStyle = story.backgroundImage 
        ? `style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(11, 15, 25, 0.95) 100%), url('${story.backgroundImage}'); background-size: cover; background-position: center;"`
        : '';

    centerStack.innerHTML += `
        <div class="hybrid-center-card" ${bgStyle} onclick="openArticleModal(${story.id})">
            <div>
                <span class="badge">${story.category}</span>
                ${scoreBadge}
                <h3>${story.title}</h3>
            </div>
            <small>📅 ${story.date}</small>
        </div>
    `;
});

    // Render Right Compact Timeline Feed
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

// 🎯 THE CLEAN UNIVERSAL CELL RENDERER (Solves the duplication loop bug completely)
function renderTargetGrid(articles, targetElementId) {
    const container = document.getElementById(targetElementId);
    if (!container) return;
    container.innerHTML = '';

    if (articles.length === 0) {
        container.innerHTML = '<p class="no-content" style="color:#64748b; font-size:0.9rem;">No entries match query.</p>';
        return;
    }

    articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'gamer-compact-card';
        card.setAttribute('onclick', `window.openArticleModal(${article.id})`);
        
        if (article.backgroundImage) {
            card.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(11,15,25,0.95) 100%), url('${article.backgroundImage}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
        } else {
            card.style.backgroundColor = 'var(--card-bg)';
        }

        const scoreBadge = article.score ? `<span class="homepage-score-box">🏆 ${article.score}</span>` : '';

        card.innerHTML = `
            <div class="gamer-card-meta-row">
                <span class="badge">${article.category}</span>
                ${scoreBadge}
            </div>
            <div class="gamer-card-info-wrap">
                <span class="card-date">${article.date}</span>
                <h3>${article.title}</h3>
            </div>
        `;
        container.appendChild(card);
    });
}


    // 🎯 REDIRECT USER TO THE NEW ARTICLE PAGE WHEN CLICKED
window.openArticleModal = function(id) {
    window.location.href = `articles/hollow-knight-article.html?id=${id}`;
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
    // If the element doesn't exist on this current page view, break out safely
    if (!sponsorSpot) return; 

    // 🎯 SMART AUTOSWITCH CORE:
    // If there are no sponsors inside content.json, do nothing! 
    // This allows the HTML pitch button we just made to stay on screen automatically.
    if (sponsors.length === 0) {
        return; 
    }

    // If an entry does exist in your database, override the box and render the live ad data
    const ad = sponsors[0]; // Pick the first sponsor active item object
    sponsorSpot.innerHTML = `
        <div class="ethical-ad-box">
            <h4>${ad.title}</h4>
            <p>${ad.excerpt}</p>
            <a href="${ad.link}" target="_blank" class="ad-link-btn">Check It Out!</a>
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

// --- UPGRADE FULL DETAILED VIEW LOOPS WITH NATIVE STEAM WIDGETS ---
async function loadFullArticlePage() {
    try {
        const response = await fetch('../content.json');
        const articles = await response.json();

        const urlParams = new URLSearchParams(window.location.search);
        const articleId = parseInt(urlParams.get('id'));
        const currentArticle = articles.find(item => item.id === articleId);

        if (!currentArticle) return;

        document.getElementById('article-view-title').textContent = currentArticle.title;
        document.getElementById('article-view-category').textContent = currentArticle.category;
        document.getElementById('article-view-date').textContent = `Published: ${currentArticle.date}`;
        
        const bodyContainer = document.getElementById('article-view-body');
        if (bodyContainer) {
            let richBodyHtml = currentArticle.fullReview || currentArticle.excerpt;
            
            // 🎯 STEAM WIDGET AUTO INJECTOR MECHANICS
            if (currentArticle.steamAppId) {
                const widgetHtml = `
                    <div class="steam-buy-widget">
                        <div class="steam-widget-header">— Buy Today —</div>
                        <h4 class="steam-card-title">${currentArticle.title.split(':')[0]}</h4>
                        <img src="${currentArticle.backgroundImage}" class="steam-card-img" alt="Steam Asset">
                        <p class="steam-card-desc">${currentArticle.steamDesc || currentArticle.excerpt}</p>
                        <div class="steam-platform-row">💻 Windows</div>
                        <a href="${currentArticle.steamAppId}" target="_blank" class="buy-steam-btn">Buy on Steam</a>
                    </div>
                `;
                richBodyHtml += widgetHtml;
            }
            bodyContainer.innerHTML = richBodyHtml;
        }

        displayComments(articleId);
    } catch (err) {
        console.error("Error drawing premium dashboard asset loops:", err);
    }
}

// 💬 BROWSER-PERSISTENT LOCAL STORAGE COMMENT ENGINE LOOPS
function setupCommentEngine() {
    const form = document.getElementById('comment-submission-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        const name = document.getElementById('user-name').value;
        const message = document.getElementById('user-message').value;
        const dateString = new Date().toLocaleDateString();

        const newComment = { name, message, date: dateString };

        // Pull previous data lists or create an empty one if blank
        let storeKey = `article-${articleId}-comments`;
        let existingComments = JSON.parse(localStorage.getItem(storeKey)) || [];
        
        existingComments.push(newComment);
        localStorage.setItem(storeKey, JSON.stringify(existingComments));

        form.reset();
        displayComments(articleId);
    });
}

function displayComments(articleId) {
    const stream = document.getElementById('comments-display-stream');
    if (!stream) return;

    let storeKey = `article-${articleId}-comments`;
    let comments = JSON.parse(localStorage.getItem(storeKey)) || [];

    if (comments.length === 0) {
        stream.innerHTML = '<p style="color:#64748b; font-size:0.9rem;">No player comments yet. Be the first to speak out!</p>';
        return;
    }

    stream.innerHTML = comments.map(c => `
        <div class="user-comment-bubble">
            <div class="comment-meta">
                <span class="comment-user-name">👤 ${c.name}</span>
                <span>📅 ${c.date}</span>
            </div>
            <p style="margin:0; font-size:1rem; line-height:1.4;">${c.message}</p>
        </div>
    `).join('');
}

function initializeCustomPlayers() {
    // Scan the article content body for custom video containers
    const players = document.querySelectorAll('.custom-video-player');
    
    players.forEach(player => {
        const video = player.querySelector('.video-element');
        const playBtn = player.querySelector('.play-pause-btn');
        const progressWrapper = player.querySelector('.timeline-slider-wrapper');
        const progressBar = player.querySelector('.progress-bar-fill');
        const timeDisplay = player.querySelector('.time-display-badge');
        const fullscreenBtn = player.querySelector('.fullscreen-toggle-btn');

        // 1. Play / Pause Actions
        function togglePlay() {
            if (video.paused) {
                video.play();
                playBtn.textContent = "⏸";
            } else {
                video.pause();
                playBtn.textContent = "▶";
            }
        }
        playBtn.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);

        // Reset play icons if video runs to completion boundaries
        video.addEventListener('ended', () => { playBtn.textContent = "▶"; });

        // 2. Timeline Progress Updates Tracking Controls
        video.addEventListener('timeupdate', () => {
            if (video.duration === 0) return;
            const percentage = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percentage}%`;
            
            // Format timestamps cleanly (e.g. 0:05 / 0:30)
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        });

        // 3. Click-to-Skip Timeline Functionality
        progressWrapper.addEventListener('click', (e) => {
            const rect = progressWrapper.getBoundingClientRect();
            const clickPositionX = e.clientX - rect.left;
            const width = rect.width;
            const seekPercentage = clickPositionX / width;
            
            video.currentTime = seekPercentage * video.duration;
        });

        // 4. Native Fullscreen Integrations Switch Hookups
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                player.requestFullscreen().catch(err => console.error(err));
            } else {
                document.exitFullscreen();
            }
        });
    });
}

// Quick mathematical string formatter for media time readouts
function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) return "0:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 🎯 DYNAMIC AUTOMATED FORMSPREE NEWSLETTER SUBMISSION ENGINE
function setupNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const feedback = document.getElementById('form-feedback-text');
    if (!form || !feedback) return; // Safely skip if elements aren't present on the current layout page

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Lock the default browser screen reload process
        
        feedback.className = "feedback-msg";
        feedback.textContent = "Deploying sublink parameters...";

        const data = new FormData(form);
        
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                form.reset(); // Safely wipe out text field string properties on successful submission
                feedback.className = "feedback-msg feedback-success";
                feedback.textContent = "✔ Operational! You are subscribed to our gaming alert network.";
            } else {
                throw new Error("Server transmission rejected parameters.");
            }
        } catch (err) {
            feedback.className = "feedback-msg feedback-error";
            feedback.textContent = "❌ Uplink error. Please try again shortly.";
        }
    });
}
