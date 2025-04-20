/**
 * Listener for messages sent from other parts of the extension (e.g., popup).
 * Handles requests that need background capabilities, like accessing the chrome.cookies API.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Log the received message for debugging
    console.log("Background Service Worker received message:", request, "from sender:", sender);

    // Handle the specific action 'getCookies'
    if (request.action === "getCookies") {
  
      // Ensure the message came from a tab context (popup action or content script)
      // so we can get the URL to query cookies for.
      if (!sender.tab || !sender.tab.url) {
        const errorMsg = "Cannot get cookies: Sender information is missing tab/URL.";
        console.error(errorMsg);
        // Send an error response back to the caller
        sendResponse({ error: errorMsg });
        // Return true to indicate we will respond asynchronously (even though we did immediately here on error).
        // It's good practice when any path might be async.
        return true;
      }
  
      // Get the URL of the tab that sent the message. This is the URL for which we want cookies.
      const url =  new URL(sender.tab.url);
      const targetUrl = url.hostname;
      console.log(`Background: Requesting cookies via chrome.cookies.getAll for URL: ${targetUrl}`);
  
      // Call the chrome.cookies API.
      // This requires the "cookies" permission and relevant "host_permissions" in manifest.json.
      chrome.cookies.getAll({ domain: targetUrl }, (cookies) => {
        // This is an asynchronous callback function.
  
        // Check for errors during the API call (e.g., permission denied).
        if (chrome.runtime.lastError) {
          const errorMsg = `chrome.cookies.getAll failed: ${chrome.runtime.lastError.message}`;
          console.error(errorMsg);
          sendResponse({ error: errorMsg });
        } else {
          // Success! Log the found cookies and send them back in the response.
          console.log(`Background: Found ${cookies.length} cookies via API for ${targetUrl}:`, cookies);
          sendResponse({ data: cookies });
        }
      });
  
      // VERY IMPORTANT: Return true to indicate that the sendResponse function
      // will be called asynchronously (because chrome.cookies.getAll has a callback).
      // If you don't return true, the message channel might close before the callback runs.
      return true;
    }
  
    // If the message action is not 'getCookies', you might handle other actions here
    // or simply let the listener finish (implicitly returning undefined).
    console.log("Background: Message action not handled:", request.action);
    // Returning false or undefined indicates we are not handling this message asynchronously.
    // return false; // Optional: Explicitly state synchronous handling or no handling
  });
  
  // Log message indicating the service worker has started. Useful for debugging.
  console.log("Background Service Worker started successfully.");
  
  // You could add other listeners here, e.g., for browser actions, tab updates, etc.
  // chrome.tabs.onUpdated.addListener(...)
  // chrome.action.onClicked.addListener(...)