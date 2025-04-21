window.SITE_CONFIG = {
  "www.marianos.com": {
    name: "Mariano's",
    apiBase: "https://www.marianos.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.kingsoopers.com": {
    name: "King Soopers",
    apiBase: "https://www.kingsoopers.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  }
};

window.getSiteConfig = function () {
  return window.SITE_CONFIG[window.location.hostname];
};
