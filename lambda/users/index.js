const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(process.env.REDIS_URL);
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

async function registerUser(payload){
    const body = JSON.parse(payload.body);

    //Store the data of user in redis with key - users:address:<<address of the user>>
    const redisResponse = await setAsync(`users:address:${body.address}`, payload.body);
    if (!redisResponse) throw new Error("Data couldnot be uploaded in redis");

    return JSON.stringify({redisResponse: redisResponse});
}

async function getUser(payload){
    const redisKey = payload.queryStringParameters.address;

    if (!redisKey) return new Error('address of the user is required');

    //Retrieve the data from redis using the key - users:address:<<address of the user>>
    return await getAsync(`users:address:${redisKey}`);
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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body: user
        };
        console.log(response);

        return response;
    } catch (err) {

        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body: JSON.stringify({
                error: err.name ? err.name : 'Exception',
                message: err.message ? err.message : 'Unknown error',
            }),
        };
    }
};
