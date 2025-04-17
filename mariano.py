import subprocess

curl_command = [
    "curl",
    "https://www.marianos.com/atlas/v1/savings-coupons/v1/coupons?projections=coupons.compact&filter.status=unclipped&filter.status=active&page.size=24&page.offset=0",
    "-H",
    "accept: application/json, text/plain, */*",
    "-H",
    "accept-language: en-US,en;q=0.9",
    "-H",
    "device-memory: 8",
    "-H",
    "priority: u=1, i",
    "-H",
    "referer: https://www.marianos.com/savings/cl/coupons/",
    "-H",
    'sec-ch-ua: "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    "-H",
    "sec-ch-ua-mobile: ?0",
    "-H",
    'sec-ch-ua-platform: "macOS"',
    "-H",
    "sec-fetch-dest: empty",
    "-H",
    "sec-fetch-mode: cors",
    "-H",
    "sec-fetch-site: same-origin",
    "-H",
    "user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    "-H",
    'x-ab-test: [{"testVersion":"A","testID":"0e5ac9","testOrigin":"21"},{"testVersion":"A","testID":"cfd681","testOrigin":"81"},{"testVersion":"B","testID":"533bb9","testOrigin":"7c"}]',
    "-H",
    'x-call-origin: {"page":"coupons","component":"ALL_COUPONS"}',
    "-H",
    "x-dtpc: 33$108936818_222h29vURAAKCROHEDHORFLAIPIILQBBBMWRATU-0e0",
    "-H",
    "x-facility-id: 53100505",
    "-H",
    'x-geo-location-v1: {"id":"db6ce924-11bb-40cd-9641-6e245dac7b73","proxyStore":"53100993"}',
    "-H",
    "x-kroger-channel: WEB",
    "-H",
    'x-laf-object: [{"modality":{"type":"PICKUP","handoffLocation":{"storeId":"53100505","facilityId":"15106"},"handoffAddress":{"address":{"addressLines":["545 N Hicks Rd"],"cityTown":"PALATINE","name":"Marianos Palatine","postalCode":"60067","stateProvince":"IL","residential":false,"countryCode":"US"},"location":{"lat":42.1199414,"lng":-88.0317866}}},"sources":[{"storeId":"53100505","facilityId":"15106"}],"assortmentKeys":["53100505"],"listingKeys":["53100505"]},{"modality":{"type":"SHIP","handoffAddress":{"address":{"postalCode":"80204","stateProvince":"CO","countryCode":"US"},"location":{"lat":39.73557663,"lng":-105.02050018}}},"sources":[{"storeId":"MKTPLACE","facilityId":"00000"}],"assortmentKeys":["MKTPLACE"],"listingKeys":["MKTPLACE"]}]',
    "-H",
    'x-modality: {"type":"PICKUP","locationId":"53100505"}',
    "-H",
    "x-modality-type: PICKUP",
    "-b",
    "<INSERT_FULL_COOKIE_STRING_HERE>",  # Replace this with the full cookie string as-is from your original curl
]

result = subprocess.run(curl_command, capture_output=True, text=True)

print("Status Code:", result.returncode)
print("Response Body:")
print(result.stdout)
