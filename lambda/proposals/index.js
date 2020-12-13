const fleekStorage = require('@fleekhq/fleek-storage-js');
const parser = require('lambda-multipart-parser');
var { v4: uuidv4 } = require('uuid');

async function uploadProposal(payload) {

    var body = JSON.parse(payload);

    if (!body.type) throw new Error('type of the proposal needs to be specified')

    const ipfsKey = body.type + uuidv4();

    body.ipfsKey = ipfsKey;

    var uploadedProposal = await fleekStorage.upload({
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET,
        key: ipfsKey,
        data: JSON.stringify(body),
    });

    uploadedProposal.ipfsKey = ipfsKey;

    return uploadedProposal;
}

async function updateProposal(payload) {

    const body = JSON.parse(payload);

    if (!body.ipfsKey) throw new Error('ipfsKey isnot found');

    var updatedProposal = await fleekStorage.upload({
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET,
        key: body.ipfsKey,
        data: JSON.stringify(body),
    });

    updatedProposal.ipfsKey = body.ipfsKey;

    return updatedProposal;
}

async function uploadFile(payload) {


    const parsedRequest = await parser.parse(payload);

    console.log(parsedRequest);


    const ipfsKey = 'image' + parsedRequest.files[0].filename + uuidv4();

    const uploadedFile = await fleekStorage.upload({
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET,
        key: ipfsKey,
        data: parsedRequest.files[0].content,
    });

    const response = {
        url: 'https://gateway.ipfs.io/ipfs/' + uploadedFile.hash
    }

    return response;
}

exports.handler = async (event) => {

    try {

        const responseCode = 200;

        var proposal;

        console.log(event);

        if (event.httpMethod === 'POST') {
            if (event.path === '/proposals') {
                proposal = await uploadProposal(event.body);
            } else {
                proposal = await uploadFile(event);
            }
        } else if (event.httpMethod === 'PUT') {
            proposal = await updateProposal(event.body);
        } else {
            throw new Error('Method doesnot exist');
        }

        const response = {
            statusCode: responseCode,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*'
            },
            body: JSON.stringify(proposal)
        };

        console.log(response);

        return response;
    } catch (err) {

        console.log(err);
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
