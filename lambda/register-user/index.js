const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const { promisify } = require('util');
const setAsync = promisify(client.set).bind(client);

exports.handler = async (event) => {
    try {
        let statusCode = 200;

        console.log(event.body);

        const body = JSON.parse(event.body);

        console.log(body.address);

        let redisResponse = await setAsync(body.address, event.body);

        if (!redisResponse) throw new Error("Data couldnot be uploaded in redis");

        let response = {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(redisResponse)
        };

        return response;
    } catch (err) {

        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: err.name ? err.name : 'Exception',
                message: err.message ? err.message : 'Unknown error',
            }),
        };
    }
};
