const redis = require('./redis');
const { IPFS_BASE_URL } = require('./constants');
const axios = require('axios');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function triggerWebhook(eventType, data) {
	// get all the subscribed Urls for receiving webhooks
	console.log('trying to connect to redis');
	const subscribedUrls = await redis.getSubscribedUrls();
	console.log("Sending data to ", subscribedUrls);

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
// randomly fetch from available ipfs urls
async function fetchFromIpfs(ipfsHash, availableIpfsUrls=IPFS_BASE_URL) {
	if(!availableIpfsUrls.length) throw new Error('Could not load data using IPFS hash. Is the hash valid?');

	const ipfsUrlIndex = Math.floor(Math.random() * availableIpfsUrls.length);
	const fetchUrl = availableIpfsUrls[ipfsUrlIndex] + ipfsHash;
	console.log("Fetching ipfs data from: ", fetchUrl);

	availableIpfsUrls = availableIpfsUrls.filter((_, index) => index != ipfsUrlIndex);

	try {
		const res = await axios.get(fetchUrl);
		return res.data;
	} catch (e) {
		console.log(JSON.stringify(e));
		return await fetchFromIpfs(ipfsHash, availableIpfsUrls);
	}
}

module.exports = {
	sleep,
	triggerWebhook,
	fetchFromIpfs
}