let isEnabled = true;
let isDarkMode = false;

// Load initial state
chrome.storage.sync.get(['enabled', 'isDarkMode'], function(result) {
  isEnabled = result.enabled !== false;
  isDarkMode = result.isDarkMode || false;
  updateIcon();
});

// Listen for color scheme updates from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'colorSchemeUpdate') {
    isDarkMode = message.isDarkMode;
    updateIcon();
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url?.includes('instagram.com')) {
    return;
  }

  isEnabled = !isEnabled;
  chrome.storage.sync.set({ enabled: isEnabled });
  updateIcon();
  
  try {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleGrid',
      enabled: isEnabled
    });
  } catch (error) {
    console.log('Tab not ready or not on Instagram');
  }
});

function updateIcon() {
  const iconBase = isDarkMode ? 'light' : 'dark';
  const state = isEnabled ? '' : '-off';
  
  const path = {
    16: `images/${iconBase}16${state}.png`,
    32: `images/${iconBase}32${state}.png`,
    48: `images/${iconBase}48${state}.png`,
    128: `images/${iconBase}128${state}.png`
  };
  
  chrome.action.setIcon({ path });
  
  // Save dark mode state
  chrome.storage.sync.set({ isDarkMode });
}