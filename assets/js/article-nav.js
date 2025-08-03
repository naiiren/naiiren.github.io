/**
 * Article Navigation Sidebar
 * Automatically generates a table of contents from article headings
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only add navigation to post pages
    const article = document.querySelector('article.post');
    if (!article) return;
    
    const postContent = article.querySelector('.post-content, .e-content');
    if (!postContent) return;
    
    // Find all headings in the article
    const headings = postContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length < 2) return; // Don't show TOC for articles with less than 2 headings
    
    // Create navigation sidebar
    const nav = document.createElement('nav');
    nav.className = 'article-nav';
    nav.innerHTML = `
        <div class="article-nav-header">
            <span class="article-nav-title">目录</span>
            <button class="article-nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
        <div class="article-nav-content">
            <ul class="article-nav-list"></ul>
        </div>
    `;
    
    const navList = nav.querySelector('.article-nav-list');
    const navToggle = nav.querySelector('.article-nav-toggle');
    const navContent = nav.querySelector('.article-nav-content');
    
    // Generate unique IDs for headings and build navigation list
    headings.forEach((heading, index) => {
        // Generate ID if not exists
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        // Get heading level for indentation
        const level = parseInt(heading.tagName.charAt(1));
        const baseLevel = parseInt(headings[0].tagName.charAt(1));
        const indent = Math.max(0, level - baseLevel);
        
        // Create navigation item
        const li = document.createElement('li');
        li.className = `nav-item nav-level-${indent}`;
        
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.className = 'nav-link';
        
        li.appendChild(a);
        navList.appendChild(li);
    });
    
    // Insert navigation into DOM
    document.body.appendChild(nav);
    
    // Toggle functionality
    navToggle.addEventListener('click', function() {
        nav.classList.toggle('collapsed');
    });
    
    // Make title clickable when collapsed
    const navTitle = nav.querySelector('.article-nav-title');
    navTitle.addEventListener('click', function() {
        if (nav.classList.contains('collapsed')) {
            nav.classList.remove('collapsed');
        }
    });
    
    // Smooth scrolling
    navList.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80; // Account for fixed header if any
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Highlight active section on scroll
    let activeLink = null;
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 100; // Offset for better UX
        
        let currentHeading = null;
        headings.forEach(heading => {
            if (heading.offsetTop <= scrollPosition) {
                currentHeading = heading;
            }
        });
        
        // Remove previous active state
        if (activeLink) {
            activeLink.classList.remove('active');
        }
        
        // Set new active state
        if (currentHeading) {
            const newActiveLink = navList.querySelector(`a[href="#${currentHeading.id}"]`);
            if (newActiveLink) {
                newActiveLink.classList.add('active');
                activeLink = newActiveLink;
            }
        }
    }
    
    // Throttled scroll listener
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveLink, 50);
    });
    
    // Initial active link setup
    updateActiveLink();
    
    // Auto-collapse on mobile after clicking a link
    navList.addEventListener('click', function() {
        if (window.innerWidth <= 1024) {
            nav.classList.add('collapsed');
        }
    });
    
    // Auto-expand/collapse based on screen size
    function handleResize() {
        if (window.innerWidth > 1024) {
            nav.classList.remove('collapsed');
        } else {
            nav.classList.add('collapsed');
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup
});
