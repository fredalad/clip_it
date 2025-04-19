// page-interactor-extension/popup.js

document.addEventListener('DOMContentLoaded', () => {
    // Get references to all the interactive elements in popup.html
    const keyInput = document.getElementById('keyInput');
    const valueInput = document.getElementById('valueInput');
    const statusDiv = document.getElementById('status');
    const cookieDisplay = document.getElementById('cookieDisplay');
    const cookieStatusDiv = document.getElementById('cookieStatus');
  
    // --- Status Update Functions ---
    // Updates the status message div for LocalStorage actions
    function setStatus(message, type = 'info') { // type can be 'info', 'success', 'error'
      statusDiv.textContent = message;
      statusDiv.className = type; // Set class for styling
      if (type === 'error') {
          console.error("LocalStorage Status:", message);
      } else {
          console.log("LocalStorage Status:", message);
      }
    }
  
    // Updates the status message div for Cookie actions
    function setCookieStatus(message, type = 'info') { // type can be 'info', 'success', 'error'
      cookieStatusDiv.textContent = message;
      cookieStatusDiv.className = type; // Set class for styling
       if (type === 'error') {
          console.error("Cookie Status:", message);
      } else {
          console.log("Cookie Status:", message);
      }
    }
  
    // --- Message Sending Logic ---
  
    /**
     * Sends a message to the content script injected into the active tab.
     * Used for actions that interact directly with the page's context (localStorage, document.cookie).
     * @param {string} action - The command to send to the content script.
     * @param {string|null} key - The key for localStorage actions (or null if not needed).
     * @param {string|null} value - The value for setLocalStorage (or null if not needed).
     */
    function sendMessageToContentScript(action, key, value = null) {
      setStatus('Sending request to page...', 'info'); // Provide immediate feedback
  
      // Find the currently active tab in the current window.
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Basic error handling if no active tab is found.
        if (!tabs || tabs.length === 0 || !tabs[0]?.id) {
          setStatus("Error: Could not find active tab.", 'error');
          return;
        }
        const activeTab = tabs[0];
  
        // Prevent interacting with special browser pages.
        if (activeTab.url?.startsWith('chrome://') || activeTab.url?.startsWith('edge://') || activeTab.url?.startsWith('about:')) {
          setStatus("Error: Cannot interact with this type of page.", 'error');
          if (action.includes('Cookie')) setCookieStatus("Error: Cannot interact with this type of page.", 'error');
          return;
        }
  
        console.log(`Popup: Sending message to Tab ID ${activeTab.id} (Content Script):`, { action, key, value });
  
        // Ensure the content script is injected before sending the message.
        // This uses the "scripting" permission.
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['content.js'] // The content script file to inject.
        }, () => {
          // Check if the injection itself failed.
          if (chrome.runtime.lastError) {
            const errorMsg = `Error injecting content script: ${chrome.runtime.lastError.message}`;
            setStatus(errorMsg, 'error');
            if (action.includes('Cookie')) setCookieStatus(errorMsg, 'error');
            console.error(errorMsg);
            return;
          }
  
          // Injection successful (or script was already present), now send the message.
          chrome.tabs.sendMessage(
            activeTab.id,
            { action: action, key: key, value: value }, // The message payload
            (response) => { // Callback function to handle the response from content.js
              const isCookieAction = action.includes('Cookie');
              const updateStatus = isCookieAction ? setCookieStatus : setStatus;
  
              // Check for errors during message sending or from the content script execution.
              if (chrome.runtime.lastError) {
                const errorMsg = `Error during message exchange: ${chrome.runtime.lastError.message}`;
                updateStatus(errorMsg, 'error');
                console.error(errorMsg);
              } else if (response && response.error) {
                const errorMsg = `Operation failed in content script: ${response.error}`;
                updateStatus(errorMsg, 'error');
                console.error(errorMsg);
              } else if (response && typeof response.data !== 'undefined') {
                // Success! Process the data received from the content script.
                console.log("Popup: Received response from Content Script:", response);
                let displayData = response.data;
  
                // Handle specific actions' success responses
                if (action === 'getLocalStorage') {
                   if (displayData !== null) {
                      // If data is an object (like getting all LS), stringify it prettily.
                      valueInput.value = (typeof displayData === 'object') ? JSON.stringify(displayData, null, 2) : displayData;
                      setStatus(`Retrieved LS value for key "${key}".`, 'success');
                   } else {
                      valueInput.value = ''; // Clear input if key not found
                      setStatus(`Key "${key}" not found in localStorage.`, 'info');
                   }
                } else if (action === 'getDocumentCookie') {
                    cookieDisplay.textContent = displayData || '(No document cookies found or accessible)';
                    setCookieStatus('Successfully retrieved document.cookie.', 'success');
                } else {
                    // For set/remove/clear LS actions, response.data is usually a status message.
                    setStatus(displayData || "LS operation successful.", 'success');
                }
              } else {
                // Handle cases where the response might be missing or malformed.
                updateStatus("Received no response or unexpected data from content script.", 'error');
                console.error("Unexpected/missing response:", response);
              }
            } // End response handler
          ); // End chrome.tabs.sendMessage
        }); // End chrome.scripting.executeScript callback
      }); // End chrome.tabs.query callback
    }
  
  
    /**
     * Sends a message to the background service worker.
     * Used for actions requiring background capabilities (like chrome.cookies API).
     * @param {string} action - The command to send to the background script.
     */
    function sendMessageToBackground(action) {
      setCookieStatus('Sending request to background...', 'info'); // Immediate feedback
  
      console.log(`Popup: Sending message to Background Script:`, { action });
  
      // Send message to the service worker.
      chrome.runtime.sendMessage({ action: action }, (response) => {
        // Callback function to handle the response from background.js
  
        // Check for errors during message sending or from background script execution.
        if (chrome.runtime.lastError) {
          const errorMsg = `Error sending message to background: ${chrome.runtime.lastError.message}`;
          setCookieStatus(errorMsg, 'error');
          console.error(errorMsg);
        } else if (response && response.error) {
          const errorMsg = `Operation failed in background script: ${response.error}`;
          setCookieStatus(errorMsg, 'error');
          console.error(errorMsg);
        } else if (response && response.data) {
          // Success! Process the cookie data received from the background script.
          console.log("Popup: Received response from Background Script:", response);
          const cookies = response.data;
          // Format the array of cookie objects as a pretty-printed JSON string.
          const formattedCookies = JSON.stringify(cookies, null, 2);
          cookieDisplay.textContent = formattedCookies;
          setCookieStatus(`Successfully retrieved ${cookies.length} cookies via API.`, 'success');
        } else if (response && response.data === null) {
           // Handle case where API call succeeded but found no cookies
           cookieDisplay.textContent = '(No cookies found for this URL via API)';
           setCookieStatus('API call successful, but no cookies found.', 'info');
        } else {
          // Handle cases where the response might be missing or malformed.
          setCookieStatus("Received no response or unexpected data from background script.", 'error');
          console.error("Unexpected/missing response from background:", response);
        }
      }); // End chrome.runtime.sendMessage
    }
  
  
    // --- Event Listeners for Buttons ---
  
    // LocalStorage Buttons
    document.getElementById('getKey')?.addEventListener('click', () => {
      const key = keyInput.value.trim();
      if (key) { sendMessageToContentScript('getLocalStorage', key); }
      else { setStatus("Please enter a LocalStorage key.", 'error'); }
    });
  
    document.getElementById('setKey')?.addEventListener('click', () => {
      const key = keyInput.value.trim();
      // Note: We don't trim the value, as whitespace might be intentional.
      if (key) { sendMessageToContentScript('setLocalStorage', key, valueInput.value); }
      else { setStatus("Please enter a LocalStorage key.", 'error'); }
    });
  
    document.getElementById('removeKey')?.addEventListener('click', () => {
      const key = keyInput.value.trim();
      if (key) { sendMessageToContentScript('removeLocalStorage', key); }
      else { setStatus("Please enter a LocalStorage key.", 'error'); }
    });
  
    document.getElementById('clearAll')?.addEventListener('click', () => {
      // Confirmation might be good here in a real extension!
      sendMessageToContentScript('clearLocalStorage', null);
    });
  
    // Cookie Buttons
    document.getElementById('getApiCookies')?.addEventListener('click', () => {
      cookieDisplay.textContent = 'Loading cookies via API...'; // Show loading state
      sendMessageToBackground('getCookies'); // Send request to background script
    });
  
    document.getElementById('getDocCookies')?.addEventListener('click', () => {
      cookieDisplay.textContent = 'Loading document.cookie...'; // Show loading state
      sendMessageToContentScript('getDocumentCookie', null); // Send request to content script
    });

    document.getElementById('trySafeway')?.addEventListener('click', () => {
      cookieDisplay.textContent = 'Running Safeway Test...'; // Show loading state
      sendMessageToContentScript('trySafeway', null); // Send request to content script
    });
  
  }); // End DOMContentLoaded listener