const fleekStorage = require('@fleekhq/fleek-storage-js');
var { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    
    try {
        let body = JSON.parse(event.body);
        let responseCode = 200;
        let ipfsKey = event.body.type + uuidv4();
            
        body.ipfsKey = ipfsKey;
            
        const uploadedProposal = await fleekStorage.upload({
            apiKey: process.env.API_KEY,
            apiSecret: process.env.API_SECRET,
            key: ipfsKey,
            data: JSON.stringify(body),
        });
        
        uploadedProposal.ipfsKey = ipfsKey;
        
        let response = {
            statusCode: responseCode,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(uploadedProposal)
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
