let isEnabled = true;

// Load initial state
chrome.storage.sync.get(['enabled'], function(result) {
  isEnabled = result.enabled !== false;
  updateIcon();
});

// Listen for icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // Check if we're on an Instagram page
  if (!tab.url?.includes('instagram.com')) {
    return;  // Not on Instagram, do nothing
  }

  isEnabled = !isEnabled;
  chrome.storage.sync.set({ enabled: isEnabled });
  updateIcon();
  
  try {
    // Send message to content script
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleGrid',
      enabled: isEnabled
    });
  } catch (error) {
    console.log('Tab not ready or not on Instagram');
  }
});

function updateIcon() {
  const path = isEnabled ? {
    16: "images/icon16.png",
    32: "images/icon32.png",
    48: "images/icon48.png",
    128: "images/icon128.png"
  } : {
    16: "images/icon16-off.png",
    32: "images/icon32-off.png",
    48: "images/icon48-off.png",
    128: "images/icon128-off.png"
  };
  
  chrome.action.setIcon({ path });
}
