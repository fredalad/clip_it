const { exec } = require('child_process');

const curlCommand = `
curl 'https://www.marianos.com/atlas/v1/savings-coupons/v1/coupons?projections=coupons.compact&filter.status=unclipped&filter.status=active' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: en-US,en;q=0.9' \
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
  -H 'x-ab-test: [{"testVersion":"A","testID":"0e5ac9","testOrigin":"21"},{"testVersion":"A","testID":"cfd681","testOrigin":"81"},{"testVersion":"B","testID":"533bb9","testOrigin":"7c"}]' \
  -H 'x-call-origin: {"page":"coupons","component":"ALL_COUPONS"}' \
  -H 'x-dtpc: 33$144962947_121h34vHRMNODKILTRNHPKCRUMRQWMFAHOOPMKP-0e0' \
  -H 'x-facility-id: 53100505' \
  -H 'x-geo-location-v1: {"id":"db6ce924-11bb-40cd-9641-6e245dac7b73","proxyStore":"53100993"}' \
  -H 'x-kroger-channel: WEB' \
  -H 'x-laf-object: [{"modality":{"type":"PICKUP","handoffLocation":{"storeId":"53100505","facilityId":"15106"},"handoffAddress":{"address":{"addressLines":["545 N Hicks Rd"],"cityTown":"PALATINE","name":"Marianos Palatine","postalCode":"60067","stateProvince":"IL","residential":false,"countryCode":"US"},"location":{"lat":42.1199414,"lng":-88.0317866}}},"sources":[{"storeId":"53100505","facilityId":"15106"}],"assortmentKeys":["53100505"],"listingKeys":["53100505"]},{"modality":{"type":"SHIP","handoffAddress":{"address":{"postalCode":"80204","stateProvince":"CO","countryCode":"US"},"location":{"lat":39.73557663,"lng":-105.02050018}}},"sources":[{"storeId":"MKTPLACE","facilityId":"00000"}],"assortmentKeys":["MKTPLACE"],"listingKeys":["MKTPLACE"]}]' \
  -H 'x-modality: {"type":"PICKUP","locationId":"53100505"}' \
  -H 'x-modality-type: PICKUP' \
  -b 'dtCookie=v_4_srv_33_sn_FDA7ABAE00438E605AD177F39CC1F349_perc_100000_ol_0_mul_1_app-3A81222ad3b2deb1ef_1_rcs-3Acss_0; pid=7072525f-2b22-2c37-feff-38143fc791e6; rxVisitor=1744818253178BVB43MGLVTFM6CFC6UBEBFANDR8SEGPI; AMCVS_371C27E253DB0F910A490D4E%40AdobeOrg=1; origin=fldc; StoreCode=00505; DivisionID=531; QSI_SI_9yJLD8psVL8MwL4_intercept=true; akaalb_KT_Digital_BannerSites=~op=KT_CT_Banner_ALayer_Atlas_Carts_v1_Central:v1-carts-atlas-alayer-central-banner-prod|KT_Digital_BannerSites_KCVG:cdc|KT_Digital_BannerSites_KCVG_Weighted:hdc|KT_Digital_BannerSites_Legacy:kcvg|~rv=81~m=v1-carts-atlas-alayer-central-banner-prod:0|cdc:0|hdc:0|kcvg:0|~os=49d9e32c4b6129ccff2e66f9d0390271~id=adaba69f8e80cad1799b2a6043a5cdc7; sid=3a8885b5-dcfb-4479-bede-e60e7acad39b; bm_so=E7AB9778C00BC69FD4A33DCE304DD15CDFD0FEF5793CAFCA54D1C6223A6EFAA6~YAAQQh/XF4ZyuhWWAQAAmuGZRAO77UtLK7+/Z4fneoGo54x0FtsTD5BwxOghlLBeGzLhIRRdjZVZttvaQ5fJbg1iyzDB1k97SPblLbZIvIV0OKQW9pEKOktsfkIcsSSwEk75ie20gF5z5hhMfs7OfWC+gTf0W4yMKJeusKPIRvH7zjPMkPG6a/cByPMXLzYo8e+CgIAB+QDRLAyV0lOfCHBBa+rmNhWr2Ouh1N0cmj1572Ke2wCKWeSsixLLBHxqTAIF2aZ6OSpcjn1NHPMlOX9SAJexujI8YUyH4rn+ohMu/4paFPCtCRqsPFT083LmOc2hShObAuHC7MEWN50stsrK54GXEXc+ircgkjCrfF7Fayqrf2zouyEFpkfa7TkGj9tWfv7pepCGEJF7YaxT3SRvUU3W7mM0fECLgeJdluE8Hjvqnr41/uYq4YKWRu7KbC5W61kOpMsG/Qx9KjNqcMsB'
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
