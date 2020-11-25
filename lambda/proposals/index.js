const fleekStorage = require('@fleekhq/fleek-storage-js');
var { v4: uuidv4 } = require('uuid');

async function uploadProposal(payload){

    var body = JSON.parse(payload);

    const ipfsKey = 'Proposal' + uuidv4();
        
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

async function updateProposal(payload){

    const body = JSON.parse(payload);

    if(!body.ipfsKey) throw new Error('ipfsKey isnot found');
        
    var updatedProposal = await fleekStorage.upload({
        apiKey: process.env.API_KEY,
        apiSecret: process.env.API_SECRET,
        key: body.ipfsKey,
        data: JSON.stringify(body),
    });
        
    updatedProposal.ipfsKey = body.ipfsKey;

    return updatedProposal;
}

exports.handler = async (event) => {
    
    try {
        
        const responseCode = 200;

        var proposal;

        console.log(event);

        if(event.httpMethod === 'POST') {
            proposal = await uploadProposal(event.body);
        } else if(event.httpMethod === 'PUT') {
            proposal = await updateProposal(event.body);
        } else {
            throw new Error('Method doesnot exist');
        }
        
        const response = {
            statusCode: responseCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
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
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: err.name ? err.name : 'Exception',
                message: err.message ? err.message : 'Unknown error',
            }),
        };
    }
};
