(function () {
  const open = XMLHttpRequest.prototype.open;
  console.log("✅ XHR interception script loaded from file");

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    console.log("📡 XHR opened:", url);

    if (url.includes('/coupons')) {
      this.addEventListener('load', function () {
        try {
          const data = JSON.parse(this.responseText);
          console.log('📦 Coupons via XHR:', data);
          window.dispatchEvent(new CustomEvent('couponsReady', { detail: data.coupons || [] }));
        } catch (err) {
          console.warn('❗ XHR parse failed', err);
        }
      });
    }

    return open.call(this, method, url, ...rest);
  };
})();
