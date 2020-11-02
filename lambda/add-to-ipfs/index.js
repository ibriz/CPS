const fleekStorage = require('@fleekhq/fleek-storage-js');
var { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    
    let body = JSON.parse(event.body);
    let responseCode = 200;
    let ipfsKey = event.body.type + uuidv4();
        
    body.ipfsKey = ipfsKey;
		
	const uploadedProposal = await fleekStorage.upload({
		apiKey: '+p9sArqKr/itlUg+AllYbw==',
		apiSecret: 'wtwqYMafL5kgXYKJerg66qchF2uksqThzoqAGZEy3Hg=',
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
};
