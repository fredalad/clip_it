const { exec } = require('child_process');

const curlCommand = `
curl 'https://www.marianos.com/atlas/v1/savings-coupons/v1/coupons?projections=coupons.compact&filter.status=unclipped&filter.status=active' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -b 'dtCookie=v_4_srv_33_sn_FDA7ABAE00438E605AD177F39CC1F349_perc_100000_ol_0_mul_1_app-3A81222ad3b2deb1ef_1_rcs-3Acss_0; pid=7072525f-2b22-2c37-feff-38143fc791e6; rxVisitor=1744818253178BVB43MGLVTFM6CFC6UBEBFANDR8SEGPI; AMCVS_371C27E253DB0F910A490D4E%40AdobeOrg=1; origin=fldc; StoreCode=00505; DivisionID=531; QSI_SI_9yJLD8psVL8MwL4_intercept=true; akaalb_KT_Digital_BannerSites=~op=KT_CT_Banner_ALayer_Atlas_Carts_v1_Central:v1-carts-atlas-alayer-central-banner-prod|KT_Digital_BannerSites_KCVG:cdc|KT_Digital_BannerSites_KCVG_Weighted:hdc|KT_Digital_BannerSites_Legacy:kcvg|~rv=81~m=v1-carts-atlas-alayer-central-banner-prod:0|cdc:0|hdc:0|kcvg:0|~os=49d9e32c4b6129ccff2e66f9d0390271~id=adaba69f8e80cad1799b2a6043a5cdc7; sid=3a8885b5-dcfb-4479-bede-e60e7acad39b; loggedIn=yes; aid_3=af7d61575f8b20f1fc9d90d77892991681f9534c6f0610e1595eff99722d12fe|; x-active-modality={"type":"PICKUP","locationId":"53100505","source":"MODALITY_OPTIONS","createdDate":1744818335524}; currentActiveListId=91489f13-10e8-4572-8099-a05f21f72aa9; AKA_A2=A; bm_ss=ab8e18ef4e; DD_guid=55552bda-1a7b-420f-b8e7-951395c45e7e; DD_modStore=53100505; bm_mi=AAF1728CEFBB75BE0251A91F6EA84095~YAAQMB/XF1kD1xWWAQAADaQUSRtO8AyvDWiXFUDjkeFx6j8JoQ+wNjFb7p60og0ryMJlpfsc7fYc8dtfL82VUbguqtO+Df/o6c0XDzaWQX6kT1vFEMWrBEo3fGDiSPrlwV/oIWn9/R+PJ1LDwKZYeX+PH0v9FVjLciBVCtdoaY5t9L7aSpF0qrBXazYhN34QmQzzqNjVw1l6lf2wHz4B47056vmlNGQaBztPy6j1NGeMPcPCQfNTjRgDVpsZ6raYPHixFSBETGGTGAZf8ZaXNHoqlVrLNb64gwzqxFJ4V6tOhLFoN+Esx0636uhDkW5F~1; bm_so=E141B9362CED55BFF309FA9A333C16C83D6AC628991DB4EA1FE908EAB25F1C20~YAAQMB/XF1sD1xWWAQAADaQUSQM1jBQYd4sepBwf4unbWxcxG1KzsG832TnKKooPFP0/TxNneMF+Ckdv9Dgk7vu6yARrD5jwlcS11fww3thcB44ewvU/ZyjRrZy2MjM3EVwOMs3TYjg0MyoJuJlMzhi+4KdaA5vH5pXssE9ig3HPNum1XbskTYd1AfIRio2toqk2uQ2/cdluStPUSH39ESxH8x9X7sBWuYK0VaTl89bSSxf+2zrYIHxsSk5tB60jiODO780AdWoFoVmcSCROoaOzMpBmqcf5NRnUw2JZ39TzKwqSJv8z2OYJWtNNWQObvJeDJb9IIVWb4jDEV0wjt+Z3ABd6pJUvkWXIlODuBonVq9MrVZ300MSvP/+EM017zxGiX6tT15YNTnP6XtoN84gJwiDSIU3qtUaVjqEKbsSh+i7VcjzB477T4OZgwTa7XSCr4SR/4hRAx/JtMS70ZfC0; ak_bmsc=486C3CB2AE96BE7576AAD9C2D4234316~000000000000000000000000000000~YAAQMB/XF9sD1xWWAQAAXasUSRujBG5liF4NwdUQk73Y8FCk2rid6xE5wIJLa9GwX6Knq6y2ek/8BF++8UebTbJ2RRJSi32tfxnu/qmvIZXyfzk05Wv7nzbFEQfFYnOcwKZdbJjg6lh/RvY2d0pZF3KaNfqgXiZHJAVwzS+C6kzn2w3lvkt/QM530aDQQflG8rjC9JCenb69pZqOpkg+LRpyzMcduTe52YzcX7UDrj2G4X/VGqDEflYQpIov/iR4hVaai3oU7LAac7HbPgRF3imWUExItFvUGzhGnLMug4cDR96jXBGR8FKFDOTjCUvqbmzmEeN1u787L7ZdI0l9jM5+QJ7VsjyBbdsPoRIIcmyr7qdewhSU/1Aaf+MNnVJtnf8g+OLLJlITsUo3UUxXYoKm69I14L7LybMrfKKrgb2ZLHyCJJtzgWAgnvjjmmJKB21nuYjSpGVYM/sVT1PwlgBgZ/ypHr4if2PkOj5p3+qtFOU=; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Apr+18+2025+09%3A26%3A54+GMT-0400+(Eastern+Daylight+Time)&version=202405.2.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=491b4d0d-0fdb-43cb-9384-f81615acfed6&interactionCount=1&isAnonUser=1&landingPath=NotLandingPage&groups=C0004%3A1%2CC0001%3A1%2CC0003%3A1%2CC0002%3A1%2CC0008%3A1%2CC0009%3A1%2CBG1216%3A1&AwaitingReconsent=false&geolocation=US%3BIL; OptanonAlertBoxClosed=2025-04-18T13:26:54.364Z; bm_lso=E141B9362CED55BFF309FA9A333C16C83D6AC628991DB4EA1FE908EAB25F1C20~YAAQMB/XF1sD1xWWAQAADaQUSQM1jBQYd4sepBwf4unbWxcxG1KzsG832TnKKooPFP0/TxNneMF+Ckdv9Dgk7vu6yARrD5jwlcS11fww3thcB44ewvU/ZyjRrZy2MjM3EVwOMs3TYjg0MyoJuJlMzhi+4KdaA5vH5pXssE9ig3HPNum1XbskTYd1AfIRio2toqk2uQ2/cdluStPUSH39ESxH8x9X7sBWuYK0VaTl89bSSxf+2zrYIHxsSk5tB60jiODO780AdWoFoVmcSCROoaOzMpBmqcf5NRnUw2JZ39TzKwqSJv8z2OYJWtNNWQObvJeDJb9IIVWb4jDEV0wjt+Z3ABd6pJUvkWXIlODuBonVq9MrVZ300MSvP/+EM017zxGiX6tT15YNTnP6XtoN84gJwiDSIU3qtUaVjqEKbsSh+i7VcjzB477T4OZgwTa7XSCr4SR/4hRAx/JtMS70ZfC0^1744982814909; firstPageViewTriggered=true; AMCV_371C27E253DB0F910A490D4E%40AdobeOrg=179643557%7CMCIDTS%7C20197%7CMCMID%7C74209001588465544723078367863015322624%7CMCAAMLH-1745587617%7C7%7CMCAAMB-1745587617%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1744990017s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C5.5.0; bm_s=YAAQMB/XFxsF1xWWAQAABrsUSQPtj8a071U9J2zRLuE2b2Ru9bC5xBGg8bZlqRjLt7HeY/zgH1zk+4aoJYlfY9iJXT+DOF1Mwv60ufRtR4LCRDhfEoIPLp4PZGIG73GsRMx8oOedvBf2p8d9Vvbw5ePX08+W9W3zAss9seKIQ1vzOn242YmCYIWvU98ascaTA5IDp02TqFjQfqfTGLAZkoGR0leWTOWzn7GSlLVEcUIN4zSAzeY6BNKQsTTDEwCgENiItni4h6EcdebHe1T7EdJAWn/zDkn3XVzyHE6d+3Ag1sFMEiA2FRrrlePpB8qy5IYoV0U2zHpCXoA8ild2BDpfYVa61E+qPC0yN2unK5N7B5d0ROz5gQpQVUkd4PLDsxFPr9sBq3933tkn+R7UCqbwH+ZlT+/Ek6xQav9oXgtJsRi2qfUhMk63QwUeMCtmuOWJdt8PY0bV+RY=; abTest=81_cfd681_A|21_0e5ac9_-1|20_7e6f96_B|be_5c1336_A|3f_8aae36_B; s_sq=krgrglobalprod%3D%2526pid%253Dhttps%25253A%25252F%25252Fwww.marianos.com%25252Fsavings%25252Fcl%25252Fcoupons%25252F%2526oid%253Dfunction%252528%252529%25257B%25255Bnativecode%25255D%25257D%2526oidt%253D2%2526ot%253DSPAN%26krgrmobileprod%3D%2526pid%253Dhttps%25253A%25252F%25252Fwww.marianos.com%25252Fsavings%25252Fcl%25252Fcoupons%25252F%2526oid%253Dfunction%252528%252529%25257B%25255Bnativecode%25255D%25257D%2526oidt%253D2%2526ot%253DSPAN; aid=52766F72BD7AF4A267AA5848AE72F98EE8A0B0CB76FDA501901D17B5E68C87AEA025C2196169B03B76BF154D898D19E5; aid_2=1744984629640|3a8885b5-dcfb-4479-bede-e60e7acad39b; bannerRememberMe=E56EB79F0240B82BF1EAF4959B1AEE351F22147BD3AD8BCF2AD40E9EEC0E24C40EA43FFE7C9DBF6DCF92AEDB7968577F536B43AC32C9FADCFE9C287D424EC23FFE852C78DEDDC1DA784365E6E8AB4A6D8106DA1DC77C56D3B87699EAF7E1E65ECBEF8FCBAFF3615E09A0B3D0D0C1C37E78EEDA5321F7D15001CEE864A6A3CCBA125E8F4111E8AAD838B6BDE0EC12BF24; bm_sz=8A23EDDDC4479BC993385F41D5C49FE2~YAAQMB/XF9gI1xWWAQAAQewUSRtA5Lh5/RZoVHEMnbRMQxIxkKjIXHCEhY8kfnngNvsAd82nfvuGULjGqthV2N0lTVBSAawZMnmyU+Y9jqKbSTt6hY/RWZ0IePBSrWv3E5kU9d+F2s1XqLoJQF76FmK5iqX9g7ft3f75ZhrrSs9i7fymgR2wKXetjkRA/OlXqnvnhrYcM0KDSompBdt2ArOBXnDW/SLMLO8SxOvEJDhs3PIUl3/TQi48+ymRDtQWgNIcjoTOXmQRMY+JHtRU4i/hKsp1wiA4qDjR5hJmIp80LdLYA7Z2n08wIiQ6spB8BzsUDixkBT7bpfmuXvr+dWSRkjXyznRKxtYz6JPayu1B/KKauEDzNYdmPqsoDKA18YqMwRvkxYSbAGblcZfNywe4cMavoPIiS07987G9VbJHkW1m466M2Att0FlbCsxEjpnL4mjZFogHkR5NUjWHzezo~3618370~3422000; RT="z=1&dm=marianos.com&si=h4bmp88ah6i&ss=m9m69v7a&sl=0&tt=0"; dtSa=-; _abck=534AFF25F649C1CB3F0FE630FD9F009D~-1~YAAQMB/XFw8J1xWWAQAAgO4USQ3PBC34VhZNiKTlylkR5Nd5l1dIkt2glYyGZV673tpzaItpP9n8//dmUiag+/m9hDW8GRSaLdcJ1J3P8HSx4KHRxzUKgKWJhPjPpm5HFnaeFNnQoJgxLtI4Q1p5WRvgBzsD+BHTWshcDWxfPme3IZY4cwkY7x+B82GoKKJNs9A60jzgBgn99hvtn3tKAOFHURhS68q1x1Lazkgp+OPWHq55pde+IJiQjVa4M3JrReVkQN8vrHi2EYHb7r9k7njA+cO268HBI5W08DYFdnIvSFh2rYuWcedfAH8q6GOLMoP1KNAWFIl2UN4dDDWYBkbHGNxgyAbdRisjHrlPZelBveqV87IK1+JUm5MXPPLmsQrm3TYaIhwgcBkdUoJbjyBWE3k5O6F+D6/iDg0cQKKR4mBNe1idpf45FLCYdVuBZ16wH/RwgjIgFpyGLeuTtgj3PEccwqhjxsPnRWvBeapoKsg7iA9sVz/NpYNrn2zRLD+oip6hz2DU+YFtUbAKsRTrDybUOOLLUla/nEPaBjdC8QrejSJ3nTypW6juBJNPamg4vEBdCWViYnHs1MhpCdZY5bk+tDdK0fVHkf5V1ZDWdxxxzsa3OP8n15fhcRqCC0eE6bih8l+63Gqu3umxysuhY5cwX2qjm0qpxMwS/5HPNsZa+ksZHcBzbcCzoNqZB612NbK+aKZC2uEBNeyAFS17J22MfgoEbMQ3Nm6FXc/0EPdeZ7NeuN5d0UJrwAHojzeefQ9UxPPU0Vw1iW9Kt/McFF8kf0PfSlR3HjhuHeJjYoDZ4/yyc5HJBBmMGcU7o0YjFCSzw8Pkp1IUnVZp~-1~-1~1744986367; bm_sv=27FE46315EB0C79E1D07946DC86136DF~YAAQMB/XF2EJ1xWWAQAA6vIUSRtPo9VLsTbX8jPLzCKCYiqGVhj2I8fskb7zGC+QG3o3UmG3IVWoGDxBVZuEeAEOJp99cDwksEGA9Lo6ocKmB28SLlBuOn187GYO2LBRnpCf0I6zSQ5F1NbfYaWjzD65/FfwNtFKqqvHuZJpT39XO9IkP+kyipt9EOoRlVJpDg7n37ftFwY6v6aU2hD3ukG9/mKaWwXCWqFke5Uad62jD1RW3t568euGvTfc8qw5/i0n~1; rxvt=1744984631845|1744982766216; dtPC=33$182830291_523h24vUJBUHBLQFBCGAJBCRPVKSTCMVKKHKACN-0e0' \
  -H 'device-memory: 8' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.marianos.com/savings/cl/coupons/' \
  -H 'sec-ch-ua: "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36' \
  -H 'x-ab-test: [{"testVersion":"A","testID":"0e5ac9","testOrigin":"21"},{"testVersion":"A","testID":"cfd681","testOrigin":"81"}]' \
  -H 'x-call-origin: {"page":"coupons","component":"ALL_COUPONS"}' \
  -H 'x-dtpc: 33$182830291_523h24vUJBUHBLQFBCGAJBCRPVKSTCMVKKHKACN-0e0' \
  -H 'x-facility-id: 53100505' \
  -H 'x-geo-location-v1: {"id":"db6ce924-11bb-40cd-9641-6e245dac7b73","proxyStore":"53100993"}' \
  -H 'x-kroger-channel: WEB' \
  -H 'x-laf-object: [{"modality":{"type":"PICKUP","handoffLocation":{"storeId":"53100505","facilityId":"15106"},"handoffAddress":{"address":{"addressLines":["545 N Hicks Rd"],"cityTown":"PALATINE","name":"Marianos Palatine","postalCode":"60067","stateProvince":"IL","residential":false,"countryCode":"US"},"location":{"lat":42.1199414,"lng":-88.0317866}}},"sources":[{"storeId":"53100505","facilityId":"15106"}],"assortmentKeys":["53100505"],"listingKeys":["53100505"]},{"modality":{"type":"SHIP","handoffAddress":{"address":{"postalCode":"80204","stateProvince":"CO","countryCode":"US"},"location":{"lat":39.73557663,"lng":-105.02050018}}},"sources":[{"storeId":"MKTPLACE","facilityId":"00000"}],"assortmentKeys":["MKTPLACE"],"listingKeys":["MKTPLACE"]}]' \
  -H 'x-modality: {"type":"PICKUP","locationId":"53100505"}' \
  -H 'x-modality-type: PICKUP'
  `;

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Exec Error:', error.message);
    return;
  }
  if (stderr) {
    console.error('⚠️ Stderr:', stderr);
  }

  try {
    const json = JSON.parse(stdout);

    // 👇 Show full detail of coupons
    json.data.coupons.forEach((coupon, index) => {
      console.log(`\n🔹 Coupon ${index + 1}:`);
      console.dir(coupon, { depth: null, colors: true });
    });

  } catch (e) {
    console.error("❌ Failed to parse JSON:", e.message);
    console.log("📄 Raw Output:", stdout);
  }
});
