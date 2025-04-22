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
