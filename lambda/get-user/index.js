const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);

exports.handler = async (event) => {
    try {
        let statusCode = 200;

        if (!event.queryStringParameters.address) return new Error('address of the user is required');

        const redisKey = event.queryStringParameters.address;

        const redisResponse = await getAsync(redisKey);

        let response = {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: redisResponse
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