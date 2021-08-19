const IconService = require('icon-sdk-js');
const axios = require('axios');

const { hgetallAsync } = require('./redis');
const { subscriptionKey } = require('./constants');

const { IconBuilder, HttpProvider } = IconService;

const provider = new HttpProvider(process.env.ICON_PROVIDER);
const iconService = new IconService(provider);

async function triggerWebhook(eventType, data) {
    // get all the subscribed Urls for receiving webhooks
    console.log("TRYING TO TRIGGER WEBHOOKS");
    const subscribedUrls = await hgetallAsync(subscriptionKey);

    if(subscribedUrls) {
        for (subscriberStr of Object.values(subscribedUrls)) {
            const subscriberDetails = JSON.parse(subscriberStr);
            const { receivingUrl, secretKey } = subscriberDetails;
            console.log(`Trying to notify ${receivingUrl}`);
            const axiosObj = {
                method: 'post',
                url: receivingUrl, 
                data: { eventType, data }, 
                headers: { 'Token': secretKey },
                timeout: 8000,
            };
            console.log(axiosObj.data);

            try {
                await axios(axiosObj);
                console.log(`Successfully notified ${receivingUrl}`);
            } catch (e) {
                console.error(`Error nofifying ${receivingUrl}`);
                console.error(e);
            }
        }
    }
}


function authenticateSubscriber(accessToken) {
    return new Promise((resolve, reject) => {
        if(!process.env['BOT_ACCESS_KEY']) {
            reject(new Error('Unable to proceed with GET request'));
        }

        if(!accessToken || accessToken !== process.env['BOT_ACCESS_KEY']) {
            reject(new ClientError('Unauthorized user'));
        }

        resolve(true);
    })
}


async function contractMethodCallService (scoreAddr, method, params=null) {
    const callObj = new IconBuilder.CallBuilder()
        .to(scoreAddr)
        .method(method)
        .params(params)
        .build();
    return await iconService.call(callObj).execute();
}

class ClientError extends Error {
    constructor(msg, statusCode=400) {
        super(msg);
        this.statusCode = statusCode;
    }
}

module.exports = {
    iconService,
    contractMethodCallService,
    triggerWebhook,
    ClientError,
    authenticateSubscriber
}