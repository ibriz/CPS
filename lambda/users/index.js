const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const { promisify } = require('util');
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

async function registerUser(payload){

    const body = JSON.parse(payload.body);

    const redisResponse = await setAsync(`address:${body.address}`, payload.body);

    if (!redisResponse) throw new Error("Data couldnot be uploaded in redis");

    return JSON.stringify({redisResponse: redisResponse});
}

async function getUser(payload){

    if (!payload.queryStringParameters.address) 
        return new Error('address of the user is required');

    const redisKey = payload.queryStringParameters.address;

    return await getAsync(`address:${redisKey}`);
}

exports.handler = async (event) => {
    try {
        const statusCode = 200;

        var user;

        console.log(event.body);

        if(event.httpMethod === 'POST') {
            user = await registerUser(event);
        } else if(event.httpMethod === 'GET') {
            user = await getUser(event);
        } else {
            throw new Error('Method doesnot exist');
        }

        const response = {
            statusCode: statusCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: user
        };

        console.log(response);

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
