// SMS number https://smstome.com/usa/phone/12174093168/sms/9236
window.buildJewelOscoHeaderFromCookie = async function (cookieObj, additonalCookie) {
    let headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-swy_api_key": "emjou",
        "x-swy_banner": "jewelosco",
        "x-swy_version": "1.0",
        "Referer": "https://www.jewelosco.com/foru/coupons-deals.html",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        //need to figure out
        "swy_sso_token": "", // SWY_SHARED_SESSION from cookie
        "x-swyconsumerdirectorypro": "", // SWY_SHARED_SESSION from cookie
        "cookie": "",


    }
    let cookieCompositionNames = [
        "akacd_PR-bg-www-prod-jewelosco",
        "visid_incap_1990338",
        "nlbi_1990338",
        "incap_ses_1327_1990338",
        "ACI_S_ECommBanner",
        "ACI_S_ECommSignInCount",
        "SAFEWAY_MODAL_LINK",
        "reese84",
        "ACI_S_SAFEWAY_KMSI",
        "SAFEWAY_RE_SIGN_IN",
        "ACI_S_USED_CREDENTIALS",
        "SWY_SYND_USER_INFO",
        "ACI_S_abs_previouslogin",
        "SWY_SHARED_SESSION_INFO",
        "SWY_SHARED_PII_SESSION_INFO",
        "SWY_SHARED_SESSION",
        "ACI_S_ECommReInit",
        "OptanonAlertBoxClosed",
        "nlbi_1990338_2147483392",
        "OptanonConsent",
    ]
    //update headers
    cookieObj['SWY_SHARED_SESSION'] = await getCookieItemByName('SWY_SHARED_SESSION',additonalCookie)
    headers.cookie = Object.entries(cookieObj)
        .filter(([key]) => cookieCompositionNames.includes(key))
        .map(([key, value]) => {
            const val = typeof value === 'object'
                ? encodeURIComponent(JSON.stringify(value))
                : encodeURIComponent(value);
            return `${key}=${val}`;
        })
        .join('; ');

    headers["swy_sso_token"] = cookieObj['SWY_SHARED_SESSION'];
    headers["x-swyconsumerdirectorypro"] = cookieObj['SWY_SHARED_SESSION'];
    console.log(`headers => ${JSON.stringify(headers)}`);
    return headers;
}

window.clipJewelOsco = async function (headers, couponObj) {
        let storedCouponDataString = window.localStorage.getItem('abJ4uCoupons');
        let storedCouponData = JSON.parse(storedCouponDataString);
        let storeId = storedCouponData.storeId;

        const url = `https://www.jewelosco.com/abs/pub/web/j4u/api/offers/clip?storeId=${storeId}`;

        const bodyObjects = Object.entries(couponObj).map(([id, coupon]) => ({
            items: [
                {clipType: "C", itemId: id, itemType: coupon.offerPgm},
                {clipType: "L", itemId: id, itemType: coupon.offerPgm}
            ]
        }));
        for (const [index, body] of bodyObjects.entries()) {
            if ((index + 1) % 5 === 0) {
                console.log(`Pausing after ${index + 1} items...`);
                await sleep(1000); // 1 second pause
            }
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                    credentials: 'include', // Optional: sends cookies if you're in the same origin
                });

                if (!res.ok) throw new Error(`Status ${res.status}: ${res.statusText}`);
                const data = await res.json();
                console.log('Clip response:', data);
                return data;
            } catch (err) {
                console.error('Fetch error:', err);
            }
        }
}

window.grabAdditionalCookieFieldsToAddToCookieObjJewel = async function (cookieObj) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "getCookies"}, response => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            if (response) {
                console.log(`response ------------ > ${response}`);
                resolve(response);
            } else {

                reject(new Error("Unable to grab cookies"));
            }
        });
    });
}
async function getCookieItemByName(name, cookieResponse) {
    let data = cookieResponse.data;
    const sessionCookie = data.find(
        item => item.name === name
    );

    if (!sessionCookie || !sessionCookie.value) {
        console.warn('SWY_SHARED_SESSION cookie not found');
        return null;
    }
    if (name === 'SWY_SHARED_SESSION') {
        try {
            // Decode the URL-encoded JSON string
            const decodedValue = decodeURIComponent(sessionCookie.value);
            console.log(`decodedValue -> ${decodedValue}`);
            // Parse the JSON to get the access token
            const sessionJson = JSON.parse(decodedValue);
            console.log(`sessionJson.accessToken -> ${JSON.stringify(sessionJson)}`);
            return sessionJson.accessToken || null;
        } catch (err) {
            console.error('Error decoding/parsing session cookie:', err);
            return null;
        }
    }
    return sessionCookie.value;
}
