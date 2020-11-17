const fleekStorage = require('@fleekhq/fleek-storage-js');

exports.handler = async (event) => {
    try {
        let body = JSON.parse(event.body);
        let responseCode = 200;

        const updatedProposal = await fleekStorage.upload({
            apiKey: process.env.API_KEY,
            apiSecret: process.env.API_SECRET,
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
