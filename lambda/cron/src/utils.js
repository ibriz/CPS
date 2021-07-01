const redis = require('./redis');

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function triggerWebhook(eventType, data) {
	// get all the subscribed Urls for receiving webhooks
	const subscribedUrls = await redis.getSubscribedUrls();
	console.log(subscribedUrls);

	console.log("-----------------SENDING THESE TO SUBSCRIBERS---------------------");
	console.log(eventType);
	console.log(JSON.stringify(data));
}