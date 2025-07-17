/**
 * Responsive Image Zoom - GitHub Pages Compatible
 * Adds click-to-zoom functionality for all images in articles
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-backdrop"></div>
        <div class="image-modal-content">
            <button class="image-modal-close" aria-label="Close image">&times;</button>
            <div class="image-modal-container">
                <img class="image-modal-img" src="" alt="">
                <div class="image-modal-controls">
                    <button class="zoom-btn zoom-out" aria-label="Zoom out">−</button>
                    <button class="zoom-btn zoom-reset" aria-label="Reset zoom">⌂</button>
                    <button class="zoom-btn zoom-in" aria-label="Zoom in">+</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Get modal elements
    const modalBackdrop = modal.querySelector('.image-modal-backdrop');
    const modalContent = modal.querySelector('.image-modal-content');
    const modalImg = modal.querySelector('.image-modal-img');
    const modalContainer = modal.querySelector('.image-modal-container');
    const closeBtn = modal.querySelector('.image-modal-close');
    const zoomInBtn = modal.querySelector('.zoom-in');
    const zoomOutBtn = modal.querySelector('.zoom-out');
    const zoomResetBtn = modal.querySelector('.zoom-reset');
    
    let currentScale = 1;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    // Find all images in article content and make them clickable
    function makeImagesClickable() {
        const contentSelectors = [
            '.post-content img',
            '.e-content img',
            'article img',
            '.content img'
        ];
        
        contentSelectors.forEach(selector => {
            const images = document.querySelectorAll(selector);
            images.forEach(img => {
                // Skip if already processed
                if (img.classList.contains('image-zoom-processed')) return;
                
                // Add clickable class and cursor
                img.classList.add('image-clickable', 'image-zoom-processed');
                img.style.cursor = 'pointer';
                
                // Add click event
                img.addEventListener('click', function(e) {
                    e.preventDefault();
                    openModal(this);
                });
            });
        });
    }
    
    function openModal(imgElement) {
        // Reset zoom and position
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        
        // Set modal image
        modalImg.src = imgElement.src;
        modalImg.alt = imgElement.alt || '';
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update transform
        updateImageTransform();
        
        // Focus for keyboard navigation
        modal.focus();
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentScale = 1;
        translateX = 0;
        translateY = 0;
    }
    
    function updateImageTransform() {
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
    
    function zoomIn() {
        currentScale = Math.min(currentScale * 1.2, 5);
        updateImageTransform();
    }
    
    function zoomOut() {
        currentScale = Math.max(currentScale / 1.2, 0.1);
        updateImageTransform();
    }
    
    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateImageTransform();
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    zoomResetBtn.addEventListener('click', resetZoom);
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case '+':
            case '=':
                zoomIn();
                break;
            case '-':
                zoomOut();
                break;
            case '0':
                resetZoom();
                break;
        }
    });
    
    // Mouse wheel zoom
    modalImg.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });
    
    // Touch and mouse drag
    modalImg.addEventListener('mousedown', startDrag);
    modalImg.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        if (currentScale <= 1) return;
        
        isDragging = true;
        modalImg.style.cursor = 'grabbing';
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        startX = clientX - translateX;
        startY = clientY - translateY;
        
        e.preventDefault();
    }
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    function drag(e) {
        if (!isDragging) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        translateX = clientX - startX;
        translateY = clientY - startY;
        
        updateImageTransform();
        e.preventDefault();
    }
    
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    
    function stopDrag() {
        isDragging = false;
        modalImg.style.cursor = 'grab';
    }
    
    // Touch zoom (pinch)
    let initialDistance = 0;
    let initialScale = 1;
    
    modalImg.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            initialScale = currentScale;
        }
    });
    
    modalImg.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scale = (currentDistance / initialDistance) * initialScale;
            currentScale = Math.max(0.1, Math.min(5, scale));
            updateImageTransform();
        }
    });
    
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Initialize
    makeImagesClickable();
    
    // Re-run when new content is loaded (for SPAs or dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                makeImagesClickable();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
