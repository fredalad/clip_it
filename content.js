(async () => {
  const hostname = location.hostname;

  const krogerDomains = [
    "www.kroger.com", "www.ralphs.com", "www.dillons.com",
    "www.smithsfoodanddrug.com", "www.kingsoopers.com",
    "www.frysfood.com", "www.qfc.com", "www.citymarket.com",
    "www.owensmarket.com", "www.jaycfoods.com", "www.pay-less.com",
    "www.bakersplus.com", "www.gerbes.com", "www.harristeeter.com",
    "www.picknsave.com", "www.metromarket.net", "www.marianos.com"
  ];
  if (krogerDomains.includes(hostname)) {
    const module = await import(chrome.runtime.getURL("content/kroger/index.js"));
    module.run(); // ← this runs inject logic
  } else {
    console.warn("🚫 No handler for this site.");
  }
})();

async function grabAdditionalCookieFieldsToAddToCookieObjJewel() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getCookies"}, response => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      if (response) {
        console.log(`response ------------ > ${response}`);
        resolve(response);
      } else {

        reject(new Error("Unable to grab cookies"));
      }
    });
  });
}

function setStatus(message, type = 'info') { // type can be 'info', 'success', 'error'
  const statusDiv = document.getElementById('extension-status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = type; // Set class for styling
    if (type === 'error') {
      console.error(" Status:", message);
    } else {
      console.log(" Status:", message);
    }
  } else {
    console.log("Status:", message, `(Element with ID 'extension-status' not found)`);
  }
}

const eventMapper = {
  "https://www.safeway.com": "trySafeway",
  "https://www.jewelosco.com": "tryJewel",

}
if (!document.getElementById('albertsons-click-button')) {
  const currentOrigin = window.location.origin;
  console.log(`currentOrigin =>  ${currentOrigin}`);
  if (eventMapper[currentOrigin]) {
    // 1. Create the main container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '10px';
    buttonContainer.style.right = '10px';
    buttonContainer.style.zIndex = '9999';
    buttonContainer.style.display = 'flex'; // Use flex to arrange button and status
    buttonContainer.style.flexDirection = 'column'; // Stack them vertically
    buttonContainer.style.alignItems = 'flex-end'; // Align items to the right

    const myButton = document.createElement('button');
    myButton.id = 'albertsons-click-button'; // Give it an ID
    myButton.textContent = 'Clip All Coupons';


    // Basic styling to make it visible
    // myButton.style.position = 'fixed'; // Keep it in view even when scrolling
    // myButton.style.top = '10px';
    // myButton.style.right = '10px';
    // myButton.style.zIndex = '9999'; // Try to keep it on top of other elements
    myButton.style.padding = '10px 15px';
    myButton.style.backgroundColor = '#007bff'; // Blue background
    myButton.style.color = 'white';
    myButton.style.border = 'none';
    myButton.style.borderRadius = '5px';
    myButton.style.cursor = 'pointer';
    myButton.style.fontSize = '14px';
    myButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    /**
     * Sends a message to the background script with the specified action.
     * @param {string} action - The command to send to the background script.
     */
    async function sendMessageToBackground(action) {
      const moreCookies = await grabAdditionalCookieFieldsToAddToCookieObjJewel();
      console.log(`moreCookies =>  ${JSON.stringify(moreCookies)}`);
      const localStorageForReq = window.localStorage.getItem('abJ4uCoupons');
      const documentCookie = window.document.cookie;
      const buildBody = {"localStorage": localStorageForReq, "documentCookie": documentCookie, "additionalCookies": moreCookies};
      console.log(`buildBody =>  ${JSON.stringify(buildBody)}`);
      setStatus('Sending request to background...', 'info');
      chrome.runtime.sendMessage(
          { action: action, data: buildBody },
          (response) => {
        if (chrome.runtime.lastError) {
          const errorMsg = `Error during message to background: ${chrome.runtime.lastError.message}`;
          setStatus(errorMsg, 'error');
          console.error(errorMsg);
          return;
        }

        if (response) {
          console.log("Content Script: Received response from background:", response);
          setStatus(response.status || "Operation completed.", response.type || 'success');
          // You can handle specific responses here if needed
        } else {
          setStatus("No response received from background.", 'warning');
        }
      });
    }


    // --- Event Listeners for Buttons ---

    // Add the click event listener
    myButton.addEventListener('click', () => sendMessageToBackground('tryJewel'));

    // Add the button to the page body
    document.body.appendChild(buttonContainer);
// Create the status display element
    const statusDiv = document.createElement('div');
    statusDiv.id = 'extension-status';
    statusDiv.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    statusDiv.style.color = 'black';
    statusDiv.style.padding = '8px 12px';
    statusDiv.style.borderRadius = '5px';
    statusDiv.style.fontSize = '12px';
    statusDiv.style.textAlign = 'right'; // Align text to the right to be under the button

    buttonContainer.appendChild(myButton);
    buttonContainer.appendChild(statusDiv);
    setStatus('Extension loaded.', 'info');


    console.log("Safeway Button Extension: Button added to the page.");
  } else {
    console.log("Not an albertsons branded page");
  }
} else {
  console.log("Safeway Button Extension: Button already exists.");
}

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
        if (request.action === 'updateStatus') {
          setStatus(request.message, request.type);
          return true;
        }

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