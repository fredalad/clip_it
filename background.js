let latestCouponHeaders = [];

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    if (details.url.includes("/atlas/v1/savings-coupons/v1/coupons")) {
      console.log("🛰 Intercepted coupon request:", details.url);
      latestCouponHeaders = details.requestHeaders;
    }
  },
  { urls: ["https://www.marianos.com/*"] },
  ["requestHeaders"]
);

// Allow content script to ask for headers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getCouponHeaders") {
    console.log("📨 Responding with captured headers");
    sendResponse(latestCouponHeaders);
    return true; // required for async response
  }
});
