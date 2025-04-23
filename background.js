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

// 🔁 Inject scripts when a supported coupon page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const isCouponPage = couponSites.some(site =>
      tab.url.includes(site) && (tab.url.includes("/savings/cl/coupons") || tab.url.includes("/savings/cl/mycoupons"))
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
