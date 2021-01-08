const redis = require('redis');
const AWS = require('aws-sdk');
const { promisify } = require('util');
var { v4: uuidv4 } = require('uuid');

const client = redis.createClient(process.env.REDIS_URL);
const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);

const TOKEN_EXPIRY = 5 * 60 * 1000;

// SES initialize
const SES = new AWS.SES({
	'region': process.env.SES_REGION
});

const emailFrom = process.env.MAIL_FROM;
const template = process.env.EMAIL_VERIFICATION_TEMPLATE;

async function send_email(emailAddress, address, token) {
	try {
		//build params for sending email
		const params = {
			Destination: {
				ToAddresses: [emailAddress],
			},
			Template: template,
			TemplateData: `{\"address\":\"${address}\",
						\"token\":\"${token}\",
                        \"subject\":\"${process.env.SUBJECT}\",
						\"frontend_url":\"${process.env.FRONTEND_URL}\",
						\"backend_url":\"${process.env.BACKEND_URL}\"}`,
			Source: emailFrom
		};
		console.log(params);
		const emailResponse = await SES.sendTemplatedEmail(params).promise();
		console.log('Email Sent Successfully to ' + JSON.stringify(emailResponse))
	} catch (error) {
		console.error('Email sending Failed! ' + error);
		throw new Error('Email sending Failed! ' + error);
	}
}

async function generateEmailVerificationToken(address, email) {
	try {
		const tokenPayload = {
			token: uuidv4(),
			createdAt: Date.now()
		}
		//Store the data of token in redis with key - token:address:<<address of the user>>
		await setAsync(`token:address:${address}`, JSON.stringify(tokenPayload));

		await send_email(email, address, tokenPayload.token);
	} catch (error) {
		console.error('Email token generation Failed! ' + error);
		throw new Error('Email token generation Failed! ' + error);
	}
}

async function registerUser(payload) {
	try {
		let body = JSON.parse(payload.body);

		if (!body.address) return new Error('address of the user is required');
		if (!body.email) return new Error('email of the user is required');

		body.verified = false;

		//Retrieve the data from redis using the key - users:address:<<address of the user>>
		const userFromRedis = await getAsync(`users:address:${body.address}`);

		const userStoredData = JSON.parse(userFromRedis);

		if(userStoredData && userStoredData.hasOwnProperty('verified') && userStoredData.email === body.email)
			body.verified = userStoredData.verified;

		//Store the data of user in redis with key - users:address:<<address of the user>>
		const redisResponse = await setAsync(`users:address:${body.address}`, JSON.stringify(body));
		if (!redisResponse) throw new Error("Data couldnot be uploaded in redis");

		await setAsync(`initialprompt:address:${body.address}`, JSON.stringify({ intialprompt: true }));

		if (body.verified === false) await generateEmailVerificationToken(body.address, body.email);

		return JSON.stringify({ redisResponse: redisResponse });
	} catch (error) {
		console.error('User Registration Failed! ' + error);
		throw new Error('User Registration Failed! ' + error);
	}
}

async function getEmailVerificationLink(payload) {
	try {
		const verificationRequest = JSON.parse(payload.body);
		const redisKey = verificationRequest.address;

		if (!redisKey) return new Error('address of the user is required');
		//Retrieve the data from redis using the key - users:address:<<address of the user>>
		const userFromRedis = await getAsync(`users:address:${redisKey}`);

		const body = JSON.parse(userFromRedis);
		if (body.verified === true) throw new Error('Email already verified');

		await generateEmailVerificationToken(redisKey, body.email);

		return JSON.stringify({ message: 'Success' });
	} catch (error) {
		console.error('User Registration Failed! ' + error);
		throw new Error('User Registration Failed! ' + error);
	}
}

async function verifyUserEmail(payload) {
	try {
		const { address, token } = payload.queryStringParameters;

		if (!address) return new Error('address of the user is required');
		if (!token) return new Error('token of the user is required');
		//Retrieve the data from redis using the key - token:address:<<address of the user>>
		const tokenFromRedis = await getAsync(`token:address:${address}`);
		const storedToken = JSON.parse(tokenFromRedis);

		if (storedToken.token !== token && (storedToken.createdAt - Date.now()) > TOKEN_EXPIRY)
			throw new Error('Token sent by the user isnot valid.')

		//Retrieve the data from redis using the key - users:address:<<address of the user>>
		const userFromRedis = await getAsync(`users:address:${address}`);
		const body = JSON.parse(userFromRedis);
		body.verified = true;

		//Store the data of user in redis with key - users:address:<<address of the user>>
		const redisResponse = await setAsync(`users:address:${body.address}`, JSON.stringify(body));
		if (!redisResponse) throw new Error("Email couldnot be verified");

		return JSON.stringify({ redisResponse: redisResponse });
	} catch (error) {
		console.error('Email Verification Failed! ' + error);
		throw new Error('Email Verification Failed! ' + error);
	}
}

async function unsubscribeUser(payload) {
	try {
		const unsubsribeRequest = JSON.parse(payload.body);

		const redisKey = unsubsribeRequest.address;
		if (!redisKey) return new Error('address of the user is required');

		//Retrieve the data from redis using the key - users:address:<<address of the user>>
		const userFromRedis = await getAsync(`users:address:${redisKey}`);
		const body = JSON.parse(userFromRedis);
		body.enableEmailNotifications = false;

		//Store the data of user in redis with key - users:address:<<address of the user>>
		const redisResponse = await setAsync(`users:address:${body.address}`, JSON.stringify(body));
		if (!redisResponse) throw new Error("Email couldnot be unsubscribed");

		return JSON.stringify({ redisResponse: redisResponse });
	} catch (error) {
		console.error('Unsubscribe User Failed! ' + error);
		throw new Error('Unsubscribe User Failed! ' + error);
	}
}

async function getUser(payload) {
	try {
		const redisKey = payload.queryStringParameters.address;

		if (!redisKey) return new Error('address of the user is required');

		//Retrieve the data from redis using the key - users:address:<<address of the user>>
		return await getAsync(`users:address:${redisKey}`);
	} catch (error) {
		console.error('Error while fetching user from redis ' + error);
		throw new Error('User not found! ' + error);
	}
}

async function setUserIntialPrompt(payload) {
	try {
		let body = JSON.parse(payload.body);

		if (!body.address) return new Error('address of the user is required');

		//Store the data of user in redis with key - users:address:<<address of the user>>
		const redisResponse = await setAsync(`initialprompt:address:${body.address}`, JSON.stringify({intialprompt: false}));
		if (!redisResponse) throw new Error("Data couldnot be uploaded in redis");

		return JSON.stringify({ redisResponse: redisResponse });
	} catch (error) {
		console.error('User Registration Failed! ' + error);
		throw new Error('User Registration Failed! ' + error);
	}
}

async function getUserIntialPrompt(payload) {
	try {
		const redisKey = payload.queryStringParameters.address;

		if (!redisKey) return new Error('address of the user is required');

		//Retrieve the data from redis using the key - users:address:<<address of the user>>
		return await getAsync(`initialprompt:address:${redisKey}`);
	} catch (error) {
		console.error('Error while fetching initialprompt from redis ' + error);
		throw new Error('User not found! ' + error);
	}
}

exports.handler = async (event) => {
	try {
		const statusCode = 200;
		var user;

		console.log(event);

		if (event.httpMethod === 'POST') {
			if (event.path === process.env.EMAIL_VERIFY_PATH)
				user = await getEmailVerificationLink(event);
			else if (event.path === process.env.INTIAL_PROMPT_PATH)
				user = await setUserIntialPrompt(event);
			else
				user = await registerUser(event);
		} else if (event.httpMethod === 'PUT') {
			user = await unsubscribeUser(event);
		} else if (event.httpMethod === 'GET') {
			if (event.path === process.env.EMAIL_VERIFY_PATH)
				user = await verifyUserEmail(event);
			else if (event.path === process.env.INTIAL_PROMPT_PATH)
				user = await getUserIntialPrompt(event);
			else
				user = await getUser(event);
		} else {
			throw new Error('Method doesnot exist');
		}

		const response = {
			statusCode: statusCode,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},
			body: user
		};
		console.log(response);

		return response;
	} catch (err) {

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
