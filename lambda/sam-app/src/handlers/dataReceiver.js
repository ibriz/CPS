const axios = require('axios');
const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

const eventTypesMapping = {
    add: 'add',
    vote: 'vote',
    approve: 'approve'
};

const resHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json'
};

async function triggerWebhook(eventType, data) {
    //loop through all the webhook urls in redis & POST
    const prevRecord = await getAsync('webhookSubscribers');
    console.log(prevRecord);
    // Redis array like this '["abc", "def", ...]'
    const datas = JSON.parse(prevRecord);
    for (d of datas) console.log(d)
    const rndm = await getAsync('jpt');
    console.log(rndm);
}

function sendEmail(eventType, data) {

}

exports.handler = async (req) => {
    try {
        const resCode = 200;
        let resBody ={};
        console.log(req);

        if (req.httpMethod === 'POST') {
            const body = JSON.parse(req.body);
            
            //eventType => one of: add, vote, approve, ...
            if(!body.eventType) {
                // throw new Error({ name: "Input Validation", message: "eventType is required"});
                throw new Error("eventType is required")
            }

            switch(body.eventType) {
                case eventTypesMapping.add:
                    // fetch project details from ipfs link provided
                    const proposalData = await axios.get(body.data.ipfsUrl);
                    await triggerWebhook(eventTypesMapping.add, proposalData);
                    break;
                case eventTypesMapping.approve:
                    await triggerWebhook(eventTypesMapping.approve, body.data);
                    break;
                case eventTypesMapping.vote:
                    await triggerWebhook(eventTypesMapping.vote, body.data);
                    break;
                default:
                    throw new Error("Invalid eventType");
            }

            const response = {
                statusCode: resCode,
                headers: resHeaders,
                body: JSON.stringify({ message: "Successfully triggered webhook for " + body.eventType})
            }
            console.log(response);
            return response;
        }
    } catch (err) {
        console.error(JSON.stringify(err));
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: resHeaders,
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        }
    }
}