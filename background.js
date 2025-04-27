import {buildJewelOscoHeaderFromCookie, clipJewelOsco} from './albertsons/jewel.js'
import {buildHeaderFromCookie, grabCookie, parseCoupons, sendClipRequest} from './albertsons/safeway.js'
const couponSites = [
  "marianos.com",
  "kroger.com",
  "kingsoopers.com",
  "ralphs.com",
  "dillons.com",
  "smithsfoodanddrug.com",
  "frysfood.com",
  "qfc.com",
  "citymarket.com",
  "jaycfoods.com",
  "pay-less.com",
  "bakersplus.com",
  "gerbes.com",
  "harristeeter.com",
  "picknsave.com",
  "metromarket.net"
];

const headerStore = {}; // Store captured headers per tabId

function sendStatusToContent(message, type = 'info') {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'updateStatus', message: message, type: type });
    } else {
      console.log("No active tab to send status update to.");
    }
  });
}
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
      sendResponse({error: errorMsg});
      // Return true to indicate we will respond asynchronously (even though we did immediately here on error).
      // It's good practice when any path might be async.
      return true;
    }

    // Get the URL of the tab that sent the message. This is the URL for which we want cookies.
    const url = new URL(sender.tab.url);
    const targetUrl = url.hostname;
    console.log(`Background: Requesting cookies via chrome.cookies.getAll for URL: ${targetUrl}`);

    // Call the chrome.cookies API.
    // This requires the "cookies" permission and relevant "host_permissions" in manifest.json.
    chrome.cookies.getAll({domain: targetUrl}, (cookies) => {
      // This is an asynchronous callback function.

      // Check for errors during the API call (e.g., permission denied).
      if (chrome.runtime.lastError) {
        const errorMsg = `chrome.cookies.getAll failed: ${chrome.runtime.lastError.message}`;
        console.error(errorMsg);
        sendResponse({error: errorMsg});
      } else {
        // Success! Log the found cookies and send them back in the response.
        console.log(`Background: Found ${cookies.length} cookies via API for ${targetUrl}:`, cookies);
        sendResponse({data: cookies});
      }
    });

    // VERY IMPORTANT: Return true to indicate that the sendResponse function
    // will be called asynchronously (because chrome.cookies.getAll has a callback).
    // If you don't return true, the message channel might close before the callback runs.
    return true;
  }
  else if (request.action === "tryJewel") {
    console.log(`request data -> ${JSON.stringify(request.data)}`);
    const localStorage = request.data['localStorage'] || null;
    const documentCookie = request.data['documentCookie'] || null;
    const additionalCookies = request.data['additionalCookies'] || null;

      try {
        const coupons =  parseCoupons(localStorage);
        console.log(`coupons -> ${JSON.stringify(coupons)}`);
        const cookies = grabCookie(documentCookie);
        console.log(`cookies -> ${JSON.stringify(cookies)}`);
        console.log("Additional cookie results:", additionalCookies);
        const builtHeader = buildJewelOscoHeaderFromCookie(cookies, additionalCookies);
        console.log(`builtHeader: ${JSON.stringify(builtHeader)}`);
        sendStatusToContent("clipping the coupons")
        const clipResponse = clipJewelOsco(builtHeader, coupons, localStorage);

        let responseData = {
          coupons,
          cookies,
          builtHeader,
          clipResponse
        };

        console.log("Content Script: Jewel flow complete:", responseData);
        sendResponse({ data: responseData, error: null });
      } catch (e) {
        let error = `tryJewel Error: ${e.message}`;
        console.error(error);
        sendResponse({ data: null, error });
      }
    sendStatusToContent("Coupon Clipping Complete!")
    return true;
  } else if (request.action === "trySafeway") {
    const response = trySafewayFunctions();
    sendResponse(response);
  }
  return true;

  });

// 🔁 Inject scripts when a supported coupon page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isCouponPage = couponSites.some(site =>
      tab.url.includes(site) && tab.url.includes("/savings/cl/coupons")
    );

    if (isCouponPage) {
      console.log("💡 Injecting scripts into:", tab.url);

      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"],
        world: "ISOLATED"
      });
    }
  }
});

// 🕵️ Capture real headers when browser hits coupon API
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const { tabId, requestHeaders, url } = details;

    if (
      url.includes("/atlas/v1/savings-coupons/v1/coupons") &&
      tabId >= 0
    ) {
      headerStore[tabId] = requestHeaders;
      console.log("📦 Stored headers for tab", tabId);
    }

    return {};
  },
  {
    urls: ["<all_urls>"],
    types: ["xmlhttprequest"]
  },
  ["requestHeaders"]
);

// 📬 Handle content script requesting those headers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getCouponHeaders") {
    const tabId = sender.tab?.id;
    const rawHeaders = headerStore[tabId];

    if (!rawHeaders) {
      console.warn("⚠️ No stored headers yet for tab", tabId);
      sendResponse({ headers: null });
      return;
    }

    const headersObj = {};
    for (const h of rawHeaders) {
      const name = h.name.toLowerCase();
      if (!["cookie", "user-agent"].includes(name)) {
        headersObj[h.name] = h.value;
      }
    }

    sendResponse({ headers: headersObj });
    return true; // Keep response channel open for async
  }
});
