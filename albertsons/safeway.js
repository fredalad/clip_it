/*
flow: 
- user navigates to: https://www.safeway.com/foru/coupons-deals.html
- abJ4uCoupons key is populated in storage -- populated at objCoupons at coupon deals page
- cookie already exists and will be pulled at time of request
- loop over object keys and send API request
- background job api request to clip
- exit and inform user
*/
const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://www.safeway.com',
    'referer': 'https://www.safeway.com/foru/coupons-deals.html',
    'priority': 'u=1, i',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    "x-swy_api_key": "emjou",
    "x-swy_banner": "safeway",
    "x-swy_version": "1.0",
    //chrome specific
    'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135",',
    'sec-ch-ua-mobile': '?0',

    //grab the others below
    'cookie': '', // see composition
    'swy_sso_token': '',  // Cookies -> SWY_SHARED_SESSION -> accessToken
    'x-swyconsumerdirectorypro':'' // Cookies -> SWY_SHARED_SESSION -> accessToken
};

/*
cookie composition: -- needs to be pulled from the original cookie
 */
const cookieCompositionNames = [
    "ACI_S_ECommBanner",
    "ACI_S_ECommReInit",
    "ACI_S_ECommSignInCount",
    "ACI_S_SAFEWAY_KMSI",
    "ACI_S_abs_previouslogin",
    "OptanonAlertBoxClosed",
    "OptanonConsent",
    "SAFEWAY_MODAL_LINK",
    "SAFEWAY_RE_SIGN_IN",
    "SWY_SHARED_PII_SESSION_INFO",
    "SWY_SHARED_SESSION",
    "SWY_SHARED_SESSION_INFO",
    "SWY_SYND_USER_INFO",
    "__eoi",
    "absVisitorId",
    "akacd_PR-bg-www-prod-safeway",
    "at_check",
    "incap_ses_1327_1610353",
    "mbox",
    "nlbi_1610353",
    "nlbi_1610353_2147483392",
    "reese84",
    "ttcsid",
    "ttcsid_CEUU933C77UA1PN5K8JG",
    "visid_incap_1610353"
];

window.navigateToSafewayCoupons = async function (){
    const targetURL = "https://www.safeway.com/foru/coupons-deals.html";
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs && tabs.length > 0) {
          chrome.tabs.update(tabs[0].id, { url: targetURL });
        }
      });    
}

window.parseCoupons = async function (){
    console.log(`parseCoupons Script: Getting localStorage item for key: abJ4uCoupons`);
    let storedCouponDataString = window.localStorage.getItem('abJ4uCoupons');
    let storedCouponData = JSON.parse(storedCouponDataString);
    console.log(`storedCouponData = ${storedCouponData}`);
    let unclippedCouponKeys = [];
    console.log(typeof storedCouponData);
    try {
        const objCouponsKeys = Object.keys(storedCouponData.objCoupons);
        const arrClippedCoupons = storedCouponData.arrClippedCoupons;

        // Use filter to create a new array with keys not in arrClippedCoupons
        unclippedCouponKeys = objCouponsKeys.filter(key => !arrClippedCoupons.includes(key));
    } catch (error) {
        console.error("Error while filtering unclipped coupons:", error);
        // Optionally handle fallback logic here
    }

    return unclippedCouponKeys;
}

window.grabCookie = async function (){
    // chrome.runtime.sendMessage({ type: 'getCookies' }, (response) => {
    //     console.log('*** grabCookie -> Cookies:', response);
    //     let cookies = response.data
    //     console.log(`*** cookies keys => ${cookies.keys()}`)
    //     // Do whatever you want with cookies here
    // });
    console.log(`cookie -> ${document.cookie}`)
    cookieStr = document.cookie
    const cookieObj = {};
    const pairs = cookieStr.split(';');
    for (let pair of pairs) {
        const [rawKey, ...rawValParts] = pair.trim().split('=');
        const key = rawKey;
        const val = rawValParts.join('=');
        try {
            const decoded = decodeURIComponent(val);
            // If the value looks like JSON, try to parse it
            cookieObj[key] = (decoded.startsWith('{') || decoded.startsWith('['))
                ? JSON.parse(decoded)
                : decoded;
        } catch (e) {
            cookieObj[key] = val;
        }
    }
    console.log(` parsed cookie cookieObj -> ${JSON.stringify(cookieObj)}`);

    return cookieObj;
}

window.buildHeaderFromCookie = async function (cookieObj){
    //build cookie header -- need composition above and 'swy_sso_token' & 'x-swyconsumerdirectorypro' from Cookies -> SWY_SHARED_SESSION -> accessToken
    const cookieHeaderString = Object.entries(cookieObj)
        .filter(([key]) => cookieCompositionNames.includes(key))
        .map(([key, value]) => {
            const val = typeof value === 'object'
                ? encodeURIComponent(JSON.stringify(value))
                : encodeURIComponent(value);
            return `${key}=${val}`;
        })
        .join('; ');

    //update headers
    headers.cookie = cookieHeaderString;
    headers["swy_sso_token"] = cookieObj['SWY_SHARED_SESSION'];
    headers["x-swyconsumerdirectorypro"] = cookieObj['SWY_SHARED_SESSION'];
    console.log(`headers => ${JSON.stringify(headers)}`);
    return headers;
}

window.sendClipRequest = async function (couponList, builtHeader){
    let storedCouponDataString = window.localStorage.getItem('abJ4uCoupons');
    let storedCouponData = JSON.parse(storedCouponDataString);
    let storeId = storedCouponData.storeId;
    let clipUrl = `https://www.safeway.com/abs/pub/web/j4u/api/offers/clip?storeId=${storeId}`;
    const bodyObjects = couponList.map(id => ({
        items: [
            { clipType: "C", itemId: id, itemType: "PD" },
            { clipType: "L", itemId: id, itemType: "PD" }
        ]
    }));
    console.log(`bodyObjects => ${JSON.stringify(bodyObjects)}`);
    bodyObjects.forEach((obj, index) => {
        console.log(`clipping coupon number ${index} - with ID: ${obj.itemId}`);
        if (index > 2){
            // don't do anything beyond 2
            return;
        }
        fetch(clipUrl, {
            method: 'POST',
            headers: builtHeader,
            body: JSON.stringify(obj)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Request failed at index ${index}`);
                }
                return response.json(); // Or text(), depending on what the server returns
            })
            .then(data => {
                console.log(`Response from object #${index + 1}:`, data);
            })
            .catch(error => {
                console.error(`Error with object #${index + 1}:`, error);
            });
    });
}