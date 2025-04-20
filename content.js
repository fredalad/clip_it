// --- Inject XHR monkey-patch into page context ---
function injectXHRInterceptor() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject-xhr.js'); // ✅ Load from your extension
  script.onload = () => script.remove(); // Clean up after loading
  (document.head || document.documentElement).appendChild(script);
}

injectXHRInterceptor();

// --- Inject your custom button ---
function injectButton() {
  const targetSection = document.evaluate(
    "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!targetSection) {
    console.warn("❗ Target section not found");
    return;
  }

  const btn = document.createElement('button');
  btn.innerText = '🔥 Clip All Coupons';
  btn.style.padding = '10px 16px';
  btn.style.backgroundColor = '#0078d4';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.marginBottom = '16px';

  // Inject the button at the top of the section
  targetSection.prepend(btn); // ✅ this makes the button visible on the page

  // On click: ask background for headers and fire the fetch
  btn.addEventListener('click', () => {
    console.log("📩 Requesting headers from background...");

    chrome.runtime.sendMessage("getCouponHeaders", (headerArray) => {
      if (!headerArray || headerArray.length === 0) {
        console.error("❌ No headers returned");
        alert("Couldn't fetch headers.");
        return;
      }

      const headers = {};
      for (const h of headerArray) {
        const name = h.name.toLowerCase();
        if (!["user-agent", "cookie", "referer"].includes(name)) {
          headers[h.name] = h.value;
        }
      }

      console.log("✅ Using headers:", headers);

      fetch("https://www.marianos.com/atlas/v1/savings-coupons/v1/coupons?projections=coupons.compact&filter.status=unclipped", {
        method: 'GET',
        credentials: 'include',
        headers: headers
      })
        .then(res => res.json())
        .then(resData => {
          console.log("🧾 Full response:", resData);
          const capturedCoupons = resData.data?.coupons || [];

          if (capturedCoupons.length === 0) {
            alert("⚠️ No coupons found.");
            return;
          }

          console.log("🚀 Clipping coupons by ID...");
          const unclippedCoupons = capturedCoupons.filter(c => c.status === "unclipped");

          unclippedCoupons.forEach(coupon => {

            const body = JSON.stringify({
              action: "CLIP",
              couponId: coupon.id
            });

            const clipHeaders = {
              ...headers,
              "Content-Type": "application/json"
            };

            fetch("https://www.marianos.com/atlas/v1/savings-coupons/v1/clip-unclip", {
              method: 'POST',
              credentials: 'include',
              headers: clipHeaders,
              body: body
            })
              .then(res => {
                if (res.ok) {
                  console.log(`✅ Clipped: ${coupon.offerTitle || coupon.displayDescription}`);
                } else {
                  console.warn(`❌ Failed to clip ${coupon.id}`, res.status);
                }
              })
              .catch(err => {
                console.error(`❌ Error clipping ${coupon.id}`, err);
              });
          });

          alert(`🚀 Attempted to clip ${capturedCoupons.length} coupons`);
        })
        .catch(err => {
          console.error("❌ Failed to fetch coupons", err);
          alert("Something went wrong fetching coupons.");
        });
    });
  });
}



// Wait for DOM to be ready and inject the button
window.addEventListener('load', () => {
  setTimeout(injectButton, 3000);
});
