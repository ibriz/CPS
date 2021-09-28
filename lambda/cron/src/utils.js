const redis = require('./redis');
const { IPFS_BASE_URL } = require('./constants');
const axios = require('axios');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// randomly fetch from available ipfs urls
async function fetchFromIpfs(ipfsHash, availableIpfsUrls=IPFS_BASE_URL) {
	if(!availableIpfsUrls.length) throw new Error('Could not load data using IPFS hash. Is the hash valid?');

	const ipfsUrlIndex = Math.floor(Math.random() * availableIpfsUrls.length);
	const fetchUrl = availableIpfsUrls[ipfsUrlIndex] + ipfsHash;
	console.log("Fetching ipfs data from: ", fetchUrl);

	availableIpfsUrls = availableIpfsUrls.filter((_, index) => index != ipfsUrlIndex);

	try {
		const res = await axios.get(fetchUrl, { timeout: 10000 });
		return res.data;
	} catch (e) {
		console.log(JSON.stringify(e));
		return await fetchFromIpfs(ipfsHash, availableIpfsUrls);
	}
}

module.exports = {
	sleep,
	fetchFromIpfs
}