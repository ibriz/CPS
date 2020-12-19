const redis = require('redis');

// Redis initialize
const client = redis.createClient(process.env.REDIS_URL);
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const getAllUserAsync = promisify(client.keys).bind(client);

async function populate_users_details(addresses_list) {
    let user_details_list = [];
    try {
        for (const address of addresses_list) {
            const address_details = await getAsync(address);

            if (address_details != null) {
                const json_address_details = JSON.parse(address_details);

                if (json_address_details.enableEmailNotifications == true && user_details_list.indexOf(json_address_details) === -1) {
                    user_details_list.push(json_address_details);
                }
            }
        }
    } catch (e) {
        console.error(e);
        console.error("Error getting addresses from Redis!");
    } finally {
        return user_details_list;
    }
}

async function get_registered_users_keys() {
    console.log("Get registered users");
    const registered_users = await getAllUserAsync(`users:address:*`);

    console.log(registered_users);
    return registered_users;
}

async function get_snapshot() {
    const snapshot = await getAsync(`period_snapshot`);

    return JSON.parse(snapshot);
}

async function set_snapshot(period) {
    console.log("Updating Period in Redis");
    const redisResponse = await setAsync(`period_snapshot`, JSON.stringify(period));
    if (!redisResponse) {
        console.error("Period couldnot be updated in Redis");
        throw new Error("Period couldnot be updated in Redis");
    }

    return period;
}

module.exports = {
    populate_users_details,
    get_registered_users_keys,
    get_snapshot,
    set_snapshot
}