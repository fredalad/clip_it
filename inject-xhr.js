(function () {
  const open = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (url.includes('/coupons')) {
      this.addEventListener('load', function () {
        try {
          const data = JSON.parse(this.responseText);
          window.dispatchEvent(new CustomEvent('couponsReady', { detail: data.coupons || [] }));
        } catch (err) {
          //
        }
      });
    }

    return open.call(this, method, url, ...rest);
  };
})();
