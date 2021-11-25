const rndToken = require('random-token').gen('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

const { ClientError, authenticateSubscriber } = require('./helpers');
const { userActions, resHeaders, subscriptionKey } = require('./constants');
const { hsetAsync, hgetAsync, hgetallAsync, hdelAsync } = require('./redis');

exports.handler = async (req) => {
    try {
        const responseCode = 200;
        let resMessage;

        // ensure user has the access token to access /subscription path
        await authenticateSubscriber(req.headers['accessToken']);

        if(req.httpMethod === 'POST') {
            const reqBody = JSON.parse(req.body);
            console.log(reqBody);
            if(!reqBody) throw new ClientError('POST Body is required');

            const { action, receivingUrl, name } = reqBody;
            if (!action) throw new ClientError("action is required");
            if (!name) throw new ClientError("name is required");

            switch (action) {
                case userActions.subscribe: {
                    console.log("TRYING TO SUBSCRIBE: ", receivingUrl);
                    // add the website info to redis
                    if (!receivingUrl) throw new ClientError("receivingUrl is required");
                    // check if the name already exists
                    const subscriber = await hgetAsync(subscriptionKey, name);
                    if(subscriber) throw new ClientError('Name already taken. Use a new name');
                    const secretKey = rndToken(60);
                    await hsetAsync(subscriptionKey, name, JSON.stringify({ receivingUrl, secretKey }));
                    resMessage = {message: "Successfully subscribed", secretKey};
                    break;
                }
                case userActions.unsubscribe: {
                    console.log("TRYING TO UNSUBSCRIBE SUBSCRIBER WITH NAME: ", name);
                    // check if already subscribed, then remove the website info from redis
                    const subscriber = await hgetAsync(subscriptionKey, name);
                    if(subscriber) {
                        const secretKey = JSON.parse(subscriber)['secretKey'];
                        if(!req.headers['Token'] || (req.headers['Token'] && req.headers['Token'] !== secretKey)) {
                            throw new ClientError("Unauthorized!", 401);
                        }
                        await hdelAsync(subscriptionKey, name);
                        resMessage = { message: "Successfully unsubscribed"};
                    }
                    else throw new ClientError("Entity with given name is not subscribed yet");
                    break;
                }
                default:
                    throw new ClientError("Invalid action");
            }

        } else if (req.httpMethod == 'GET') {
            const urls = await hgetallAsync(subscriptionKey);
            console.log(urls);
            resMessage = JSON.parse(JSON.stringify(urls));
        }
        const response = {
            statusCode: responseCode,
            headers: resHeaders,
            body: JSON.stringify(resMessage)
        };

        console.log(response);

        return response;

    } catch (err) {
        console.error(err);
		return {
			statusCode: err.statusCode ? err.statusCode : 500,
			headers: resHeaders,
			body: JSON.stringify({
				error: err.name ? err.name : 'Exception',
				message: err.message ? err.message : 'Unknown error',
			}),
		};
    }
}