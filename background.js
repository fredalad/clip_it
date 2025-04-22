let latestCouponHeaders = [];

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.url.includes("/atlas/v1/savings-coupons/v1/coupons")) {
      latestCouponHeaders = details.requestHeaders;
    }
  },
  { urls: [
    "https://www.kroger.com/*",
    "https://www.ralphs.com/*",
    "https://www.dillons.com/*",
    "https://www.smithsfoodanddrug.com/*",
    "https://www.kingsoopers.com/*",
    "https://www.frysfood.com/*",
    "https://www.qfc.com/*",
    "https://www.citymarket.com/*",
    "https://www.jaycfoods.com/*",
    "https://www.pay-less.com/*",
    "https://www.bakersplus.com/*",
    "https://www.gerbes.com/*",
    "https://www.harristeeter.com/*",
    "https://www.picknsave.com/*",
    "https://www.metromarket.net/*",
    "https://www.marianos.com/*"
  ] },
  ["requestHeaders"]
);

// Allow content script to ask for headers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getCouponHeaders") {
    sendResponse(latestCouponHeaders);
    return true; // required for async response
  }
});
