// TODOs: only allow owners to update their subscription record

const rndToken = require('random-token').gen('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

const { ClientError } = require('./helpers');
const { userActions, resHeaders, subscriptionKey } = require('./constants');
const { hsetAsync, hgetAsync, hgetallAsync, hdelAsync } = require('./redis');

exports.handler = async (req) => {
    try {
        const responseCode = 200;
        let resMessage;

        if(req.httpMethod === 'POST') {
            const reqBody = JSON.parse(req.body);
            console.log(reqBody);
            if(!reqBody) throw new ClientError('POST Body is required');
            const { action, receivingUrl, name } = reqBody;

            if (!action) throw new ClientError("action is required");
            if (!name) throw new ClientError("name is required");

            switch (action) {
                case userActions.subscribe: {
                    // TODO: add username authentication when subscribing
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