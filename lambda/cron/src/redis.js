const redis = require('redis');

// const REDIS_URL = process.env.REDIS_URL
const REDIS_URL = 'redis://192.168.1.72:6379';

// Redis initialize
const client = redis.createClient(REDIS_URL);
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const getAllUserAsync = promisify(client.keys).bind(client);
const hgetallAsync = promisify(client.hgetall).bind(redisClient);

async function populate_users_details(addresses_list) {
	let user_details_list = [];
	try {
		for (const address of addresses_list) {
			const address_details = await getAsync(address);

			if (address_details != null) {
				const json_address_details = JSON.parse(address_details);

				if (json_address_details.enableEmailNotifications && json_address_details.verified  && user_details_list.indexOf(json_address_details) === -1) {
					user_details_list.push(json_address_details);
				}
			}
		}
	} catch (e) {
		console.error(e);
		console.error("Error getting addresses from Redis!");
	} finally {
		console.log('populate_users_details' + JSON.stringify(user_details_list));
		return user_details_list;
	}
}

async function get_registered_users_keys() {
	console.log("Get registered users");
	const registered_users = await getAllUserAsync(`users:address:*`);

	console.log(registered_users);
	return registered_users;
}

function getSubscribedUrls() {
	return hgetallAsync(subscriptionKey);
}

module.exports = {
	populate_users_details,
	get_registered_users_keys,
	getSubscribedUrls
}