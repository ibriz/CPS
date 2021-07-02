const IconService = require('icon-sdk-js');

const { hgetallAsync } = require('./redis');
const { subscriptionKey } = require('./constants');

const { IconBuilder, HttpProvider } = IconService;

const provider = new HttpProvider(process.env.ICON_PROVIDER);
const iconService = new IconService(provider);

async function triggerWebhook(eventType, data) {
    // get all the subscribed Urls for receiving webhooks
    const subscribedUrls = await hgetallAsync(subscriptionKey);
    console.log(subscribedUrls);

    console.log("-----------------SENDING THESE TO SUBSCRIBERS---------------------");
    console.log(eventType);
    console.log(JSON.stringify(data));
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
    ClientError
}