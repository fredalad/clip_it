window.SITE_CONFIG = {
  "www.kroger.com": {
    name: "Kroger",
    apiBase: "https://www.kroger.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.ralphs.com": {
    name: "Ralphs",
    apiBase: "https://www.ralphs.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.dillons.com": {
    name: "Dillons",
    apiBase: "https://www.dillons.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.smithsfoodanddrug.com": {
    name: "Smith’s",
    apiBase: "https://www.smithsfoodanddrug.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.kingsoopers.com": {
    name: "King Soopers",
    apiBase: "https://www.kingsoopers.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.frysfood.com": {
    name: "Fry’s",
    apiBase: "https://www.frysfood.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.qfc.com": {
    name: "QFC",
    apiBase: "https://www.qfc.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.citymarket.com": {
    name: "City Market",
    apiBase: "https://www.citymarket.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.owensmarket.com": {
    name: "Owen’s",
    apiBase: "https://www.owensmarket.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.jaycfoods.com": {
    name: "Jay C",
    apiBase: "https://www.jaycfoods.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.pay-less.com": {
    name: "Pay Less",
    apiBase: "https://www.pay-less.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.bakersplus.com": {
    name: "Baker’s",
    apiBase: "https://www.bakersplus.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.gerbes.com": {
    name: "Gerbes",
    apiBase: "https://www.gerbes.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.harristeeter.com": {
    name: "Harris Teeter",
    apiBase: "https://www.harristeeter.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.picknsave.com": {
    name: "Pick ‘n Save",
    apiBase: "https://www.picknsave.com",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.metromarket.net": {
    name: "Metro Market",
    apiBase: "https://www.metromarket.net",
    xpath: "/html/body/div[1]/div/div[8]/div[1]/main/section/div/section[2]"
  },
  "www.marianos.com": {
    name: "Mariano’s",
    apiBase: "https://www.marianos.com",
    xpath: "/html/body/div[1]/div/div[6]/div[1]/main/section/div/section[2]/section"
  }
};

export function getSiteConfig() {
  return SITE_CONFIG[window.location.hostname];
}