// PhishShield - Senior Browser Extension Engineer Fixes
// Properly declare tabStates and persist it using globalThis for stability within the worker scope
globalThis.tabStates = globalThis.tabStates || {};

// Global Error Handling to prevent unhandled promise rejections and crashes
self.addEventListener("unhandledrejection", (event) => {
  console.error("[PhishShield] Unhandled Promise Rejection:", event.reason);
});

self.addEventListener("error", (event) => {
  console.error("[PhishShield] Global Service Worker Error:", event.message);
});

// --- CONFIGURATION ---
// Set to false for production, true for local development
const DEV_MODE = false; 

const API_BASE_URL = DEV_MODE 
  ? "http://localhost:8000" 
  : "https://phishshield-api.onrender.com";

const API_KEY = "phishshield-ext-key-2026";

console.log(`[PhishShield] Initialized in ${DEV_MODE ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`[PhishShield] API Base URL: ${API_BASE_URL}`);


// --- Client ID Management ---
let clientId = null;

async function getClientId() {
  if (clientId) return clientId;
  
  return new Promise((resolve) => {
    chrome.storage.local.get(['clientId'], (result) => {
      if (result.clientId) {
        clientId = result.clientId;
      } else {
        // Generate new UUID
        clientId = 'ext_' + self.crypto.randomUUID();
        chrome.storage.local.set({ clientId: clientId });
      }
      resolve(clientId);
    });
  });
}

// --- Utility: Fetch with Retry for Render Cold Starts ---
async function fetchWithRetry(url, options, maxRetries = 3) {
  const currentClientId = await getClientId();
  options.headers = options.headers || {};
  options.headers['x-client-id'] = currentClientId;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 401) throw new Error("Unauthorized - API Key is invalid or missing");
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Fetch failed, retrying (${i + 1}/${maxRetries}). Waking up server...`);
      // Wait 3 seconds before retrying to allow Render to wake up
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Store information about each tab's state in session storage (MV3 best practice)
async function getTabState(tabId) {
  // Check globalThis first for instant availability, then fallback to session storage
  if (globalThis.tabStates[`tab_${tabId}`]) {
    return globalThis.tabStates[`tab_${tabId}`];
  }
  
  return new Promise((resolve) => {
    try {
      chrome.storage.session.get([`tab_${tabId}`], (result) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        const state = result[`tab_${tabId}`] || null;
        if (state) globalThis.tabStates[`tab_${tabId}`] = state; // Sync back to globalThis
        resolve(state);
      });
    } catch (e) {
      console.error("[PhishShield] Error getting tab state:", e);
      resolve(null);
    }
  });
}

async function setTabState(tabId, state) {
  try {
    globalThis.tabStates[`tab_${tabId}`] = state; // Persist in globalThis
    return chrome.storage.session.set({ [`tab_${tabId}`]: state });
  } catch (e) {
    console.error("[PhishShield] Error setting tab state:", e);
  }
}

async function deleteTabState(tabId) {
  try {
    delete globalThis.tabStates[`tab_${tabId}`]; // Remove from globalThis
    return chrome.storage.session.remove([`tab_${tabId}`]);
  } catch (e) {
    console.error("[PhishShield] Error deleting tab state:", e);
  }
}

async function clearAllTabStates() {
  globalThis.tabStates = {}; // Clear globalThis state as well
  return chrome.storage.session.clear();
}
const MAX_HISTORY_ITEMS = 10; // Maximum number of scan history items to keep

// Get the domain name from a URL
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}

// Save the scan result to browser's local storage
function storeScanHistory(result) {
  chrome.storage.local.get(["scanHistory"], (res) => {
    const history = res.scanHistory || [];
    history.unshift({
      url: result.url,
      isPhishing: result.isPhishing,
      timestamp: new Date().toISOString(),
      reported: false
    });

    // Keep only the last 10 items
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }

    chrome.storage.local.set({ scanHistory: history });
  });
}

// Show a warning or safe popup on the webpage
function injectPopup(tabId, url, isPhishing, isSamePage = false) {
  const hostname = new URL(url).hostname;

  if (isPhishing) {
    // Create and show phishing warning popup
    const popupHTML = `
      <div id="phishing-warning-popup" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 999999;
        max-width: 400px;
        font-family: Arial, sans-serif;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center;">
            <span style="font-size: 24px; margin-right: 10px;">⚠️</span>
            <h3 style="margin: 0;">PHISHING WARNING!</h3>
          </div>
          <button id="close-popup-btn" style="
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
          ">×</button>
        </div>
        <p style="margin: 10px 0;">The website "${hostname}" has been detected as a potential phishing site.</p>
        <div style="display: flex; gap: 10px; margin-top: 15px;">
          <button id="report-btn" style="
            background: white;
            color: #ff4444;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          ">Report</button>
        </div>
      </div>
    `;

    // Inject the popup into the webpage
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (html) => {
        // Remove any existing popup
        const existingPopup = document.getElementById('phishing-warning-popup');
        if (existingPopup) existingPopup.remove();

        // Add new popup
        const popup = document.createElement('div');
        popup.innerHTML = html;
        document.body.appendChild(popup);

        // Add event listeners for popup buttons
        document.getElementById('close-popup-btn').addEventListener('click', () => {
          popup.remove();
        });

        document.getElementById('report-btn').addEventListener('click', () => {
          window.open('https://safebrowsing.google.com/safebrowsing/report_phish/?url=' + encodeURIComponent(window.location.href), '_blank');
        });
      },
      args: [popupHTML]
    }).catch(err => console.warn("[PhishShield] Could not inject warning popup:", err.message));
  } else if (isSamePage) {
    // Create and show same page indicator
    const samePageHTML = `
      <div id="same-page-indicator" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        gap: 5px;
        animation: fadeOut 5s forwards;
      ">
        <span style="font-size: 16px;">🔄</span>
        <span style="font-size: 14px;">Same Website</span>
        <button id="close-samepage-btn" style="
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          margin-left: 5px;
          padding: 0 5px;
        ">×</button>
      </div>
      <style>
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      </style>
    `;

    // Inject the same page indicator into the webpage
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (html) => {
        // Remove any existing indicators
        const existingPopup = document.getElementById('phishing-warning-popup');
        const existingTick = document.getElementById('safe-url-indicator');
        const existingSamePage = document.getElementById('same-page-indicator');
        if (existingPopup) existingPopup.remove();
        if (existingTick) existingTick.remove();
        if (existingSamePage) existingSamePage.remove();

        // Add new same page indicator
        const indicator = document.createElement('div');
        indicator.innerHTML = html;
        document.body.appendChild(indicator);

        // Add event listener for close button
        document.getElementById('close-samepage-btn').addEventListener('click', () => {
          indicator.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
          indicator.remove();
        }, 5000);
      },
      args: [samePageHTML]
    }).catch(err => console.warn("[PhishShield] Could not inject same-page indicator:", err.message));
  } else {
    // Create and show safe URL indicator
    const tickHTML = `
      <div id="safe-url-indicator" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: Arial, sans-serif;
        display: flex;
        align-items: center;
        gap: 5px;
        animation: fadeOut 5s forwards;
      ">
        <span style="font-size: 16px;">✓</span>
        <span style="font-size: 14px;">Safe</span>
        <button id="report-safe-btn" style="
          background: none;
          border: none;
          color: white;
          font-size: 14px;
          cursor: pointer;
          margin-left: 5px;
          padding: 0 5px;
          text-decoration: underline;
        ">Report</button>
        <button id="close-tick-btn" style="
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          margin-left: 5px;
          padding: 0 5px;
        ">×</button>
      </div>
      <style>
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      </style>
    `;

    // Inject the safe indicator into the webpage
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (html) => {
        // Remove any existing indicators
        const existingPopup = document.getElementById('phishing-warning-popup');
        const existingTick = document.getElementById('safe-url-indicator');
        const existingSamePage = document.getElementById('same-page-indicator');
        if (existingPopup) existingPopup.remove();
        if (existingTick) existingTick.remove();
        if (existingSamePage) existingSamePage.remove();

        // Add new tick mark
        const tick = document.createElement('div');
        tick.innerHTML = html;
        document.body.appendChild(tick);

        // Add event listeners for indicator buttons
        document.getElementById('close-tick-btn').addEventListener('click', () => {
          tick.remove();
        });

        document.getElementById('report-safe-btn').addEventListener('click', () => {
          window.open('https://safebrowsing.google.com/safebrowsing/report_phish/?url=' + encodeURIComponent(window.location.href), '_blank');
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
          tick.remove();
        }, 5000);
      },
      args: [tickHTML]
    }).catch(err => console.warn("[PhishShield] Could not inject safe indicator:", err.message));
  }
}

// Main function to check if a URL is phishing
async function checkForPhishing(url, tabId, isReload = false) {
  try {
    const domain = getDomain(url);

    // Ignore restricted protocols
    if (url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('devtools://') ||
      url.startsWith('about:') ||
      url.startsWith('edge://')) {
      return;
    }

    // Get tab state from async storage
    const tabState = await getTabState(tabId);

    // ===================================================
    // SAME DOMAIN CHECK LOGIC
    // ===================================================
    // Get the most recent scan from history
    const history = await new Promise((resolve) => {
      chrome.storage.local.get(["scanHistory"], (res) => {
        resolve(res.scanHistory || []);
      });
    });

    // If we have scan history
    if (history.length > 0) {
      // Get the domain from the most recent scan
      const mostRecentDomain = getDomain(history[0].url);

      // If the current domain matches the most recently scanned domain
      if (mostRecentDomain === domain) {
        // If this is a reload, show the same indicator as before
        if (isReload) {
          injectPopup(tabId, url, history[0].isPhishing, false);
        }

        // Update tab state
        await setTabState(tabId, {
          domain: domain,
          previousUrl: url
        });

        return history[0];
      }
    }
    // ===================================================

    // List of trusted websites that we don't need to check
    const trustedDomains = [
      'google.com',
      'openai.com',
      'chatgpt.com',
      'chat.openai.com',
      'microsoft.com',
      'github.com',
      'stackoverflow.com',
      'linkedin.com',
      'facebook.com',
      'twitter.com',
      'youtube.com',
      'amazon.com',
      'netflix.com',
      'spotify.com',
      'reddit.com',
      'wikipedia.org',
      'medium.com',
      'quora.com',
      'dropbox.com',
      'slack.com',
      'discord.com',
      'zoom.us',
      'mozilla.org',
      'apple.com',
      'adobe.com',
      'cloudflare.com'
    ];

    // If domain is trusted locally, we still want it logged in the backend dashboard
    const isTrusted = trustedDomains.some(trustedDomain => domain.includes(trustedDomain));
    if (isTrusted) {
      // Fire-and-forget fetch to ensure the backend logs this as a SAFE scan
      fetchWithRetry(`${API_BASE_URL}/api/scan-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({ url: url, source: "extension" }),
      }).catch(err => console.error("Failed to log trusted domain:", err));

      const result = {
        url,
        isPhishing: false,
        timestamp: new Date().toISOString()
      };

      // Save result locally and show safe indicator
      storeScanHistory(result);
      injectPopup(tabId, url, false, false);

      return result;
    }

    // Check URL using our ML model
    const response = await fetchWithRetry(`${API_BASE_URL}/api/scan-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY
      },
      body: JSON.stringify({ url: url, source: "extension" }),
    });

    const data = await response.json();
    const isPhishing = data.isPhishing;

    // Update tab information
    await setTabState(tabId, {
      domain: domain,
      previousUrl: url
    });

    // Create result object
    const result = {
      url,
      isPhishing,
      timestamp: new Date().toISOString()
    };

    // Save result and show appropriate popup
    storeScanHistory(result);
    injectPopup(tabId, url, isPhishing, false);

    return result;
  } catch (error) {
    console.error(`[PhishShield] Scan error for ${url}:`, error);
    return { error: error.message };
  }
}

// Function to limit how often we check URLs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create a debounced version of checkForPhishing
const debouncedCheck = debounce(checkForPhishing, 500);

// Watch for when user navigates to a new page
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0) { // Only check main page, not iframes
    const isReload = details.transitionType === 'reload';
    debouncedCheck(details.url, details.tabId, isReload);
  }
});

// Watch for when user switches to a different tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      debouncedCheck(tab.url, activeInfo.tabId, false);
    }
  });
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  deleteTabState(tabId).catch(err => console.error("Error deleting tab state:", err));
});

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "getCurrentStatus") {
      // Send current URL status to popup
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        try {
          if (tabs[0] && tabs[0].url) {
            const url = tabs[0].url;
            const result = await checkForPhishing(url, tabs[0].id, false);
            sendResponse(result);
          } else {
            sendResponse({ error: "No active tab found" });
          }
        } catch (innerError) {
          console.error("[PhishShield] Error in getCurrentStatus query:", innerError);
          sendResponse({ error: innerError.message });
        }
      });
      return true;
    } else if (request.action === "getHistory") {
      // Send scan history to popup
      chrome.storage.local.get(["scanHistory"], (res) => {
        sendResponse(res.scanHistory || []);
      });
      return true;
    } else if (request.action === "getClientId") {
      // Send clientId to content script
      getClientId().then(id => {
        sendResponse({ clientId: id });
      }).catch(err => {
        console.error("[PhishShield] Error getting clientId:", err);
        sendResponse({ error: err.message });
      });
      return true;
    }
  } catch (outerError) {
    console.error("[PhishShield] Error in onMessage listener:", outerError);
    sendResponse({ error: outerError.message });
  }
});

// Listen for cleanup alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanup-tab-states-alarm") {
    console.log("[DEBUG] Periodic cleanup of tab states");
    clearAllTabStates().catch(err => console.error("Error clearing tab states:", err));
  }
});

// --- Heartbeat Logic Using chrome.alarms ---

async function sendPing() {
  try {
    const currentClientId = await getClientId();
    console.log(`[DEBUG] Attempting to send ping for client: ${currentClientId}`);
    
    const response = await fetch(`${API_BASE_URL}/api/extension/ping`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "x-api-key": API_KEY, // Sending both for compatibility
        "x-client-id": currentClientId
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[PhishShield] Ping SUCCESS:`, data);
    } else {
      const errorText = await response.text();
      console.error(`[DEBUG] Ping failed with status ${response.status}: ${errorText}`);
      // Simple retry logic: if it's a transient error, the next alarm will handle it.
      // We could add more immediate retry here if needed.
    }
  } catch (error) {
    console.error(`[PhishShield] Ping ERROR:`, error.message);
  }
}

// Heartbeat Logic - No need to call create here, moved to onInstalled

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "extension-ping-alarm") {
    sendPing();
  }
});

// Initial ping on startup (immediate)
sendPing();

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log("[DEBUG] Extension installed/updated - initializing alarms");
  
  // Create alarm for pings (exactly every 5 seconds)
  chrome.alarms.create("extension-ping-alarm", {
    periodInMinutes: 5 / 60 
  });

  // Create alarm for cleanup (every 30 minutes)
  chrome.alarms.create("cleanup-tab-states-alarm", {
    periodInMinutes: 30
  });

  sendPing();
});

// Listen for browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log("[DEBUG] Browser started - sending immediate ping");
  sendPing();
});

// Log when the extension starts
console.log("Phishing Detector background script initialized with Alarm API"); 