let isEnabled = true;

// Load initial state
chrome.storage.sync.get(['enabled'], function(result) {
  isEnabled = result.enabled !== false;
  updateIcon();
  // Sync all open Instagram tabs
  chrome.tabs.query({url: "*://*.instagram.com/*"}, function(tabs) {
    tabs.forEach(tab => {
      try {
        chrome.tabs.sendMessage(tab.id, {
          action: 'syncState',
          enabled: isEnabled
        });
      } catch (error) {
        console.log('Tab not ready:', error);
      }
    });
  });
});

// Listen for icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // First, check for any Instagram tabs
  const instagramTabs = await chrome.tabs.query({url: "*://*.instagram.com/*"});
  
  if (instagramTabs.length > 0) {
    // If we have Instagram tabs, activate the first one
    await chrome.tabs.update(instagramTabs[0].id, { active: true });
    // If the tab is in a different window, focus that window
    await chrome.windows.update(instagramTabs[0].windowId, { focused: true });
  } else {
    // If no Instagram tab exists, create one
    await chrome.tabs.create({ url: "https://www.instagram.com" });
    return; // Return early as the new tab won't be ready for state changes yet
  }

  // Only proceed with state toggle if we're on Instagram
  if (!tab.url?.includes('instagram.com')) {
    return;
  }

  isEnabled = !isEnabled;
  chrome.storage.sync.set({ enabled: isEnabled });
  updateIcon();
  
  // Sync all Instagram tabs, not just the active one
  chrome.tabs.query({url: "*://*.instagram.com/*"}, function(tabs) {
    tabs.forEach(tab => {
      try {
        chrome.tabs.sendMessage(tab.id, {
          action: 'syncState',
          enabled: isEnabled
        });
      } catch (error) {
        console.log('Tab not ready:', error);
      }
    });
  });
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