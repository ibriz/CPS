const fleekStorage = require('@fleekhq/fleek-storage-js');
const parser = require('lambda-multipart-parser');
const AWS = require('aws-sdk');
const redis = require('redis');
const { promisify } = require('util');
var { v4: uuidv4 } = require('uuid');

// Redis initialize
const client = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(client.get).bind(client);

// SES initialize
const SES = new AWS.SES();

const emailFrom = process.env.MAIL_FROM;
const subject = process.env.SUBJECT;
const template = process.env.SPONSORSHIP_REQUEST_TEMPLATE;

async function send_email(emailAddress, body) {
    try {
        //build params for sending email
        const params = {
            Destination: {
                ToAddresses: [emailAddress],
            },
            Template: template,
            TemplateData: JSON.stringify({ ...body, subject }),
            Source: emailFrom
        };
        const emailResponse = await SES.sendTemplatedEmail(params).promise();
        console.log('Email Sent Successfully to ' + emailResponse)
    } catch (error) {
        console.error('Email sending Failed! ' + error);
        throw new Error('Email sending Failed! ' + error);
    }
}

async function uploadProposal(body) {
    try {
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

exports.handler = async (event) => {
    try {
        const responseCode = 200;
        var proposal;

        console.log(event);

        const body = JSON.parse(event.body);

        if (!body.type) throw new Error('type of the proposal needs to be specified');

        if (event.httpMethod === 'POST') {
            if (event.path === process.env.PROPOSAL_PATH) {
                proposal = await uploadProposal(body);

                const sponsor = JSON.parse(await getAsync(`users:address:${body.sponsor_address}`));
                console.log(sponsor);

                if (sponsor.enableEmailNotifications) await send_email(sponsor.email, body);
            } else {
                proposal = await uploadFile(event);
            }
        } else if (event.httpMethod === 'PUT') {
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
