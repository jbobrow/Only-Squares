console.log('Instagram Only Squares Extension loaded!');

let isEnabled = true;
const originalPaddings = new WeakMap();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'syncState') {
    isEnabled = request.enabled;
    if (isEnabled) {
      adjustGrid();
    } else {
      restoreOriginalLayout();
    }
  }
});

function adjustGrid() {
    if (!isEnabled) return;
    
    const posts = document.querySelectorAll('._aagv');
    console.log(`Found ${posts.length} posts to adjust`);
    
    posts.forEach(post => {
        // Store original padding if we haven't already
        if (!originalPaddings.has(post)) {
            const computedStyle = window.getComputedStyle(post);
            originalPaddings.set(post, computedStyle.paddingBottom);
        }
        post.style.paddingBottom = '100%';
    });
}

function restoreOriginalLayout() {
    const posts = document.querySelectorAll('._aagv');
    posts.forEach(post => {
        const originalPadding = originalPaddings.get(post);
        if (originalPadding) {
            post.style.paddingBottom = originalPadding;
        } else {
            // If we don't have the original value stored, remove our override
            post.style.removeProperty('padding-bottom');
        }
    });
}

// Modified observer to handle both states
let lastUrl = location.href;
const observer = new MutationObserver((mutations) => {
    // Check for URL changes
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
            if (isEnabled) {
                adjustGrid();
            }
        }, 1000);
        return;
    }
    
    // Check for new posts being added
    const hasNewPosts = mutations.some(mutation => 
        Array.from(mutation.addedNodes).some(node => 
            node.classList && 
            node.querySelector('._aagv')
        )
    );
    
    if (hasNewPosts) {
        console.log('New posts detected');
        if (isEnabled) {
            adjustGrid();
        }
    }
});

observer.observe(document, {
    childList: true,
    subtree: true
});