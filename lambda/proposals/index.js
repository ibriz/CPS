const fleekStorage = require('@fleekhq/fleek-storage-js');
const parser = require('lambda-multipart-parser');
const AWS = require('aws-sdk');
const redis = require('redis');
const { promisify } = require('util');
var { v4: uuidv4 } = require('uuid');

// Redis initialize
const client = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(client.get).bind(client);
const delAsync = promisify(client.del).bind(client);

// SES initialize
const SES = new AWS.SES({
	'region': process.env.SES_REGION
});

const emailFrom = process.env.MAIL_FROM;
const template = process.env.SPONSORSHIP_REQUEST_TEMPLATE;
const sponsorAcceptTemplate = process.env.SPONSORSHIP_ACCEPTED_TEMPLATE;

async function send_email(firstName, emailAddress, body) {
	try {
		//build params for sending email
		const params = {
			Destination: {
				ToAddresses: [emailAddress],
			},
			Template: template,
			TemplateData: `{\"proposalName\":\"${body.projectName}\",
											\"firstName\":\"${firstName}\",
                        \"contributor_address\":\"${body.sponserPrep}\",
                        \"subject\":\"${process.env.SUBJECT}\",
                        \"frontend_url":\"${process.env.FRONTEND_URL}\"}`,
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

async function uploadProposal(body) {
	try {
		if (!body.ipfsKey) {
			const ipfsKey = body.type + uuidv4();
			body.ipfsKey = ipfsKey;
		} else {
			await delAsync(`address:${body.address}:type:${body.type}:drafts:${body.ipfsKey}`);
		}

		var uploadedProposal = await fleekStorage.upload({
			apiKey: process.env.API_KEY,
			apiSecret: process.env.API_SECRET,
			key: body.ipfsKey,
			data: JSON.stringify(body),
		});
		uploadedProposal.ipfsKey = body.ipfsKey;

		return uploadedProposal;
	} catch (error) {
		console.error('Upload Proposal failed ' + error);
		throw new Error('Upload Proposal failed ' + error);
	}
}

async function updateProposal(body) {
	try {
		if (!body.ipfsKey) throw new Error('ipfsKey isnot found');

		var updatedProposal = await fleekStorage.upload({
			apiKey: process.env.API_KEY,
			apiSecret: process.env.API_SECRET,
			key: body.ipfsKey,
			data: JSON.stringify(body),
		});
		updatedProposal.ipfsKey = body.ipfsKey;

		return updatedProposal;
	} catch (error) {
		console.error('Update Proposal failed ' + error);
		throw new Error('Update Proposal failed ' + error);
	}
}

async function uploadFile(payload) {
	try {
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
	} catch (error) {
		console.error('Upload File failed ' + error);
		throw new Error('Upload File failed ' + error);
	}
}

async function notifySponsorship (projectName, address, sponsorAddress, sponsorAction) {
	// sponsorAction: accepted or rejected
	try {
		// fetch contributor's email from redis
		const rawUserDetails = await getAsync(`users:address:${address}`);
		const userDetails = JSON.parse(rawUserDetails);
		if(!userDetails) throw new Error("User not found!");
		//build params for sending email
		const params = {
			Destination: {
				ToAddresses: [userDetails.email],
			},
			Template: sponsorAcceptTemplate,
			TemplateData: `{
				\"firstName\": \"${userDetails.firstName}\",
				\"project_title\": \"${projectName}\",
				\"sponsor_address\": \"${sponsorAddress}\",
				\"sponsor_action\": \"${sponsorAction}\",
				\"contributor_address\": \"${address}\",
				\"frontend_url\": \"${process.env.FRONTEND_URL}\"
			}`,
			Source: emailFrom
		};
		console.log(params);
		const emailResponse = await SES.sendTemplatedEmail(params).promise();
		console.log('Email Sent Successfully to ' + JSON.stringify(emailResponse));
		return { message: `Successfully sent email to ${userDetails.email}`}
	} catch (error) {
		console.error('Email sending Failed! ' + error);
		throw new Error('Email sending Failed! ' + error);
	}
}

exports.handler = async (event) => {
	try {
		const responseCode = 200;
		var proposal;

		console.log(event);

		if (event.httpMethod === 'POST') {
			if (event.path === process.env.PROPOSAL_PATH) {
				console.log("RECEIVED REQUEST TO UPLOAD PROPOSAL AND SEND SPONSORSHIP REQUEST EMAIL");
				//sample body: {"projectName":"testProj","category":"Development","projectDuration":"1","totalBudget":"100","sponserPrep":"hxd47ad924eba01ec91330e4e996cf7b8c658f4e4c","sponserPrepName":"CPS Test P-Rep3(DO NOT DELEGATE)","description":"<p>jaskldfjksld sdfksjd fksdjfk sdjfk sdjlfkjsadflk sjkldfj slkdj lksdjf lksdjlk sjkdl jsdlksdj dkf d df</p>","milestones":[{"name":"test-milestone","duration":"1","budget":null,"description":null}],"teamName":"test-team","teamEmail":"test-email@ibriz.com","teamSize":"10","address":"hx0dc852acca3aba28881963c665b557582de55356","type":"proposal"}
				const body = JSON.parse(event.body);
				if (!body.type) throw new Error('type of the proposal needs to be specified');

				proposal = await uploadProposal(body);

				const sponsorData = await getAsync(`users:address:${body.sponserPrep}`);

				if (sponsorData != null) {
					const sponsor = JSON.parse(sponsorData);
					console.log(sponsor);

					if (body.type === 'proposal' && sponsor.verified && sponsor.enableEmailNotifications) await send_email(sponsor.firstName, sponsor.email, body);
				}

			} else if (event.path === process.env.SPONSOR_NOTIFY_PATH) {
				console.log("RECEIVED REQUEST TO SEND SPONSORSHIP ACCEPTED/REJECTED EMAIL");
				// notify user about sponsorship being accepted using projectName and contributor's address
				const body = JSON.parse(event.body);
				if(!body || !body.projectName || !body.address || !body.sponsorAddress || !body.sponsorAction) {
					throw new Error('projectName, address, sponsorAddress and sponsorAction need to be specified');
				}
				console.log(`Sending email to ${body.address} about sponsorship acceptance`);
				proposal = await notifySponsorship(body.projectName, body.address, body.sponsorAddress, body.sponsorAction);
			
			} else {
				proposal = await uploadFile(event);
			}
		} else if (event.httpMethod === 'PUT') {
			console.log("RECEIVED REQUEST TO UPDATE PROPOSAL");
			console.log(event.body);
			const body = JSON.parse(event.body);
			if (!body.type) throw new Error('type of the proposal needs to be specified');

			proposal = await updateProposal(body);
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
