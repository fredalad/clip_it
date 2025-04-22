(function () {
  function main() {
    const config = getSiteConfig();
    if (!config) {
      console.warn("❗ Unsupported site");
      return;
    }
    
    observeAndInjectButton(config);
  }

  // --- Inject status box ---
  function injectStatusBox() {
    if (document.getElementById('clip-status-box')) return;

    const box = document.createElement('div');
    box.id = 'clip-status-box';
    box.style.position = 'fixed';
    box.style.bottom = '20px';
    box.style.right = '20px';
    box.style.backgroundColor = 'rgba(0,0,0,0.75)';
    box.style.color = '#fff';
    box.style.padding = '12px 16px';
    box.style.borderRadius = '8px';
    box.style.zIndex = '9999';
    box.style.fontSize = '14px';
    box.style.maxWidth = '300px';
    box.style.lineHeight = '1.4';
    box.style.display = 'none';
    box.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    document.body.appendChild(box);
  }

  function updateStatusBox(message) {
    const box = document.getElementById('clip-status-box');
    if (box) {
      box.style.display = 'block';
      box.innerText = message;
    }
  }

  function generatePausePoints(total, minGap = 8, maxGap = 15) {
    const points = [];
    let i = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
    while (i < total) {
      points.push(i);
      i += Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
    }
    return points;
  }

  function injectButton(config) {
    const targetSection = document.evaluate(
      config.xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    if (!targetSection || document.getElementById('clipAllBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'clipAllBtn';
    btn.innerText = `🔥 Clip All Coupons (${config.name})`;
    btn.style.padding = '10px 16px';
    btn.style.backgroundColor = '#0078d4';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.marginBottom = '16px';

    targetSection.prepend(btn);
    injectStatusBox();
    
    btn.addEventListener('click', () => {
      console.log("📩 Requesting headers from background...");
    
      chrome.runtime.sendMessage("getCouponHeaders", (response) => {
        if (!response || !response.headers) {
          alert("Couldn't fetch headers.");
          return;
        }
    
        const headers = {
          ...response.headers,
          "Content-Type": "application/json"
        };
    
        console.log("✅ Using headers:", headers);
    
        fetch(`${config.apiBase}/atlas/v1/savings-coupons/v1/coupons?projections=coupons.compact&filter.status=unclipped&filter.status=active`, {
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
    
            const unclippedCoupons = capturedCoupons.filter(c => c.status === "unclipped").slice(0, 1);
            updateStatusBox(`🚀 Starting to clip ${unclippedCoupons.length} coupons (max 200)...`);
            throttleClipping(unclippedCoupons, headers, config);
          })
          .catch(err => {
            console.error("❌ Failed to fetch coupons", err);
            alert("Something went wrong fetching coupons.");
          });
      });
    });
    
  }

  async function throttleClipping(coupons, headers, config) {
    let successCount = 0;
    const pausePoints = generatePausePoints(coupons.length);
    console.log("📌 Long pause at indexes:", pausePoints);

    for (let i = 0; i < coupons.length; i++) {
      const coupon = coupons[i];
      const body = JSON.stringify({
        action: "CLIP",
        couponId: coupon.id
      });

      const clipHeaders = {
        ...headers,
        "Content-Type": "application/json"
      };

      try {
        const res = await fetch(`${config.apiBase}/atlas/v1/savings-coupons/v1/clip-unclip`, {
          method: 'POST',
          credentials: 'include',
          headers: clipHeaders,
          body: body
        });

        if (res.ok) {
          successCount++;
          console.log(`✅ (${i + 1}/${coupons.length}) Clipped: ${coupon.offerTitle || coupon.displayDescription}`);
          updateStatusBox(`✅ Clipped ${i + 1} of ${coupons.length}: ${coupon.offerTitle || coupon.displayDescription}`);
        } else {
          console.warn(`❌ (${i + 1}/${coupons.length}) Failed to clip ${coupon.id}`, res.status);
          updateStatusBox(`⚠️ Failed to clip ${i + 1}: ${coupon.offerTitle || "Unknown"}`);
        }
      } catch (err) {
        console.error(`❌ (${i + 1}/${coupons.length}) Error clipping ${coupon.id}`, err);
        updateStatusBox(`💥 Error clipping ${i + 1}: ${coupon.offerTitle || "Unknown"}`);
      }

      const shortDelay = Math.floor(Math.random() * 200) + 100;
      await new Promise(resolve => setTimeout(resolve, shortDelay));

      if (pausePoints.includes(i + 1)) {
        const longDelay = Math.floor(Math.random() * 1000) + 1500;
        updateStatusBox(`⏱️ Random pause for ${longDelay}ms after ${i + 1} clips...`);
        await new Promise(resolve => setTimeout(resolve, longDelay));
      }
    }

    if (successCount === coupons.length) {
      updateStatusBox(`🎉 All ${coupons.length} coupons clipped! Refreshing...`);
      setTimeout(() => location.reload(), 3000);
    } else {
      updateStatusBox(`✅ ${successCount}/${coupons.length} clipped. No refresh.`);
      setTimeout(() => {
        const box = document.getElementById('clip-status-box');
        if (box) box.style.display = 'none';
      }, 4000);
    }
  }

  function observeAndInjectButton(config) {
    const observer = new MutationObserver(() => {
      const target = document.evaluate(
        config.xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;

      if (target && !document.getElementById('clipAllBtn')) {
        injectButton(config);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ✅ Re-run main() if URL changes (SPA support)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log("🔁 URL changed:", currentUrl);
      main();
    }
  }).observe(document, { subtree: true, childList: true });

  // 🚀 Initial load
  main();
})();
