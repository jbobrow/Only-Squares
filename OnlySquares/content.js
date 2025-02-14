console.log('Instagram Only Squares Extension loaded!');

let isEnabled = true;
const originalPaddings = new WeakMap();

// Check color scheme and send to background script
function checkColorScheme() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  chrome.runtime.sendMessage({
    type: 'colorSchemeUpdate',
    isDarkMode: isDarkMode
  });
}

// Listen for color scheme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  checkColorScheme();
});

// Initial color scheme check
checkColorScheme();

chrome.runtime.sendMessage({ action: 'contentScriptReady' });

chrome.storage.sync.get(['enabled'], function(result) {
  isEnabled = result.enabled !== false;
  if (isEnabled) adjustGrid();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleGrid') {
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
            post.style.removeProperty('padding-bottom');
        }
    });
}

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