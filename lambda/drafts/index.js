const fleekStorage = require('@fleekhq/fleek-storage-js');
var { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(process.env.REDIS_URL);

const setAsync = promisify(client.hmset).bind(client);
const getAllAsync = promisify(client.hgetall).bind(client);

async function uploadDraftToIPFS(payload) {

    let body = JSON.parse(payload);

    if (!body.type) throw new Error('type field missing')

    const ipfsKey = body.type + uuidv4();

    body.ipfsKey = ipfsKey;

    let uploadedProposal = await fleekStorage.upload({
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET,
        key: ipfsKey,
        data: JSON.stringify(body),
    });

    uploadedProposal.ipfsKey = body.ipfsKey;
    uploadedProposal.address = body.address;
    uploadedProposal.type = body.type;

    return uploadedProposal;
}

async function updateDraftToIPFS(payload) {

    const body = JSON.parse(payload);

    if (!body.ipfsKey) throw new Error('ipfsKey field missing');
    if (!body.address) throw new Error('address field missing');
    if (!body.type) throw new Error('type field missing')

    let updatedProposal = await fleekStorage.upload({
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET,
        key: body.ipfsKey,
        data: JSON.stringify(body),
    });

    updatedProposal.ipfsKey = body.ipfsKey;
    updatedProposal.address = body.address;
    updatedProposal.type = body.type;

    console.log(updatedProposal);

    return updatedProposal;
}

async function addHashToRedis(proposal) {

    const redisResponse = await setAsync(`address:${proposal.address}:type:${proposal.type}`, 
                                            `drafts:${proposal.ipfsKey}`, 
                                            'https://gateway.ipfs.io/ipfs/' + proposal.hash);

    if (!redisResponse) throw new Error("Data couldnot be uploaded in redis");

    console.log("Response from Redis" + redisResponse);

    console.log(await getAllAsync(`drafts`));

    return JSON.stringify({ redisResponse: redisResponse });
}

async function getUserDrafts(payload) {

    if (!payload.queryStringParameters.address)
        return new Error('address of the user is required');

    if (!payload.queryStringParameters.type)
        return new Error('type of the draft is required');

    const { address, type } = payload.queryStringParameters;

    const drafts = await getAllAsync(`address:${address}:type:${type}`);

    console.log(drafts);

    return drafts;
}

exports.handler = async (event) => {

    try {

        const responseCode = 200;

        let drafts;

        console.log(event);

        if (event.httpMethod === 'POST') {
            drafts = await uploadDraftToIPFS(event.body);
            await addHashToRedis(drafts);
        } else if (event.httpMethod === 'PUT') {
            drafts = await updateDraftToIPFS(event.body);
            await addHashToRedis(drafts);
        } else if (event.httpMethod === 'GET') {
            drafts = await getUserDrafts(event);
        } else {
            throw new Error('Method doesnot exist');
        }

        console.log(drafts);

        const response = {
            statusCode: responseCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(drafts)
        };

        console.log(response);

        return response;
    } catch (err) {

        console.log(err);
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
