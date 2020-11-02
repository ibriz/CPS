const fleekStorage = require('@fleekhq/fleek-storage-js');

exports.handler = async (event) => {
    
    let body = JSON.parse(event.body);
    let responseCode = 200;
		
	const updatedProposal = await fleekStorage.upload({
		apiKey: '+p9sArqKr/itlUg+AllYbw==',
		apiSecret: 'wtwqYMafL5kgXYKJerg66qchF2uksqThzoqAGZEy3Hg=',
		key: body.ipfsKey,
		data: JSON.stringify(body),
    });
	
	let response = {
        statusCode: responseCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(updatedProposal)
    };
        
    return response;
};
