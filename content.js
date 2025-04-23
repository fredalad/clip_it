/**
 * Content script: Runs in the context of the web page.
 * Listens for messages from the popup to interact with the page's
 * localStorage and document.cookie (non-HttpOnly cookies).
 */

// Use a flag to prevent multiple logs if the script gets injected multiple times unnecessarily.
if (typeof window.pageInteractorContentScriptInjected === 'undefined') {
    window.pageInteractorContentScriptInjected = true;
    console.log("Page Interactor Content Script Loaded and Initialized.");
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Content Script received message:", request, "from sender:", sender);
  
      let responseData = null;
      let error = null;
  
      try {
        // --- Action Handlers ---
  
        // == LocalStorage Actions ==
        if (request.action === "getLocalStorage") {
          if (request.key) {
            console.log(`Content Script: Getting localStorage item for key: ${request.key}`);
            responseData = window.localStorage.getItem(request.key);
            console.log(`Content Script: Value found: ${responseData}`);
          } else {
            // Get all items if no key is specified
            console.log("Content Script: Getting all localStorage items.");
            responseData = { ...window.localStorage }; // Clone localStorage object
          }
        } else if (request.action === "setLocalStorage") {
          if (request.key && typeof request.value !== 'undefined') {
            console.log(`Content Script: Setting localStorage item: Key=${request.key}, Value=${request.value}`);
            window.localStorage.setItem(request.key, request.value);
            responseData = `Successfully set '${request.key}' in page localStorage.`;
          } else {
            error = "Content Script Error: Missing key or value for setLocalStorage action.";
            console.error(error);
          }
        } else if (request.action === "removeLocalStorage") {
          if (request.key) {
            console.log(`Content Script: Removing localStorage item for key: ${request.key}`);
            window.localStorage.removeItem(request.key);
            responseData = `Removed '${request.key}' from page localStorage.`;
          } else {
            error = "Content Script Error: Missing key for removeLocalStorage action.";
            console.error(error);
          }
        } else if (request.action === "clearLocalStorage") {
          console.log("Content Script: Clearing all page localStorage.");
          window.localStorage.clear();
          responseData = `Cleared all page localStorage.`;
        }
  
        // == Document Cookie Action ==
        else if (request.action === "getDocumentCookie") {
          console.log("Content Script: Getting document.cookie.");
          // Directly access the page's non-HttpOnly cookies visible to JavaScript
          responseData = document.cookie;
          console.log(`Content Script: document.cookie value: ${responseData}`);
        } else if (request.action === "trySafeway") {
          console.log("Content Script: trySafeway action triggered.");

          (async () => {
            try {
              const coupons = await window.parseCoupons();
              const cookies = await window.grabCookie();
              const builtHeader = await window.buildHeaderFromCookie(cookies);
              const clipResponse = await window.sendClipRequest(coupons, builtHeader);

              responseData = {
                coupons,
                cookies,
                builtHeader,
                clipResponse
              };

              console.log("Content Script: Safeway flow complete:", responseData);
              sendResponse({ data: responseData, error: null });
            } catch (e) {
              error = `trySafeway Error: ${e.message}`;
              console.error(error);
              sendResponse({ data: null, error });
            }
          })();

          return true; // Keep the message channel open for async
        } else if (request.action === "tryJewel") {
          console.log("Content Script: tryJewel action triggered.");

          (async () => {
            try {
              const coupons = await window.parseCoupons();
              const cookies = await window.grabCookie();
              let additionalCookies = null;
              additionalCookies = await window.grabAdditionalCookieFieldsToAddToCookieObjJewel(cookies);
              console.log("Additional cookie results:", additionalCookies);
              const builtHeader = await window.buildJewelOscoHeaderFromCookie(cookies, additionalCookies);
              const clipResponse = await window.sendClipRequest(coupons, builtHeader);

              responseData = {
                coupons,
                cookies,
                builtHeader,
                clipResponse
              };

              console.log("Content Script: Jewel flow complete:", responseData);
              sendResponse({ data: responseData, error: null });
            } catch (e) {
              error = `tryJewel Error: ${e.message}`;
              console.error(error);
              sendResponse({ data: null, error });
            }
          })();

          return true; // Keep the message channel open for async
        }

        // == Unknown Action ==
        else {
          error = `Content Script Error: Unknown action requested: ${request.action}`;
          console.warn(error);
        }
      } catch (e) {
        // Catch any unexpected errors during execution
        error = `Content Script Execution Error: ${e.message}`;
        console.error(error, e);
      }
  
      // Send the response back to the caller (the popup script)
      console.log("Content Script: Sending response:", { data: responseData, error: error });
      sendResponse({ data: responseData, error: error });
  
      // Return true to indicate potential asynchronous response, although all actions here
      // are currently synchronous. It's good practice for consistency with background script.
      return true;
    });
  
  } else {
    // This can happen if executeScript is called again on the same frame before page reload.
    console.log("Page Interactor Content Script already injected.");
  }