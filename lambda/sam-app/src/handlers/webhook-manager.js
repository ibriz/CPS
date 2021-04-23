// TODOs: only allow owners to update their subscription record

const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient(process.env.REDIS_URL);
const hsetAsync = promisify(redisClient.hset).bind(redisClient);
const hgetAsync = promisify(redisClient.hget).bind(redisClient);
const hdelAsync = promisify(redisClient.hdel).bind(redisClient);
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);

redisClient.on('error', function (err) {
    console.error("Redis error encountered ", JSON.stringify(err));
});
redisClient.on('end', function () {
    console.log("Redis connection closed");
});

const subscriptionKey = 'subscriber';

const userActions = {
    subscribe: 'subscribe',
    unsubscribe: 'unsubscribe',
    getAll: 'list'
};

const resHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json'
};

exports.handler = async (req) => {
    try {
        const responseCode = 200;
        let resMessage;

        if(req.httpMethod === 'POST') {
            const reqBody = JSON.parse(req.body);
            const { action, receivingUrl, name } = reqBody;

            if (!action) throw new Error("action is required");
            if (!name) throw new Error("name is required");

            switch (action) {
                case userActions.subscribe:
                    // add the website info to redis
                    if (!receivingUrl) throw new Error("receivingUrl is required");
                    await hsetAsync(subscriptionKey, name, receivingUrl);
                    resMessage = {message: "Successfully subscribed"};
                    break;

                case userActions.unsubscribe:
                    // check if already subscribed, then remove the website info from redis
                    const subscriber = await hgetAsync(subscriptionKey, name);
                    if(subscriber) {
                        await hdelAsync(subscriptionKey, name);
                        resMessage = { message: "Successfully unsubscribed"};
                    }
                    else throw new Error("Entity with given name is not subscribed yet");
                    break;

                default:
                    throw new Error("Invalid action");
            }

        } else if (req.httpMethod == 'GET') {
            const urls = await hgetallAsync(subscriptionKey);
            console.log(urls);
            resMessage = JSON.parse(JSON.stringify(urls));

        }
        const response = {
            statusCode: responseCode,
            headers: resHeaders,
            body: JSON.stringify(resMessage)
        };

        console.log(response);

        return response;

    } catch (err) {
        console.error(err);
		return {
			statusCode: err.statusCode ? err.statusCode : 500,
			headers: resHeaders,
			body: JSON.stringify({
				error: err.name ? err.name : 'Exception',
				message: err.message ? err.message : 'Unknown error',
			}),
		};
    }
}