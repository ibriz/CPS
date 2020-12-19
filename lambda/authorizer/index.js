const secp = require('secp256k1');
const ethUtil = require('ethereumjs-util');
const sha3_256 = require('js-sha3').sha3_256;

const VALID_TIME = parseInt(process.env.SIGNATURE_VALID_TIME) * 60 * 1000;

function validateSignature(signature, address, payload) {

    const signatureArray = Buffer.from(signature, 'base64');
    const signatureBuffer = signatureArray.subarray(0, 64);
    const recoveryBuffer = signatureArray.subarray(64);

    //Genrate the public key from signature, recovery_key and payload
    const publicKey = secp.ecdsaRecover(signatureBuffer,
        parseInt(recoveryBuffer.toString('hex')),
        new Uint8Array(Buffer.from(payload, 'hex')),
        false);
    const publicKeyBuffer = ethUtil.toBuffer(publicKey.slice(1));

    console.log('Length of public key buffer:' + publicKeyBuffer.length);

    //Decode the address from public key hash by taking last 40 bytes
    //Adding hx as prefix for idenitifying the EOA in ICON
    const decodedAddress = 'hx' + sha3_256(publicKeyBuffer).slice(-40);

    console.log('Requestor address' + decodedAddress);

    return address === decodedAddress;
}

function isSignatureRecent(payload) {
    const timestamp = payload.slice(payload.length - 13);

    return (Date.now() - parseInt('0x' + timestamp)) <  VALID_TIME;
}

function buildAllowAllPolicy(event) {
    const policy = {
        'principalId': 'user',
        'policyDocument': {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Action': 'execute-api:Invoke',
                    'Effect': 'Allow',
                    'Resource': event.methodArn
                }
            ]
        }
    }

    return policy;
}

exports.handler = function (event, _context, callback) {
    try {
        console.log(event);

        const { signature, address, payload } = event.headers;

        // Validation and Signature Verification
        if (!(signature && address && payload)) return callback('Signature, Address and Payload required');
        if (!validateSignature(signature, address, payload)) return callback('Mismatched signature');
        if (!isSignatureRecent(payload)) return callback('Signature expired');

        //Building access for request
        const authResponse = buildAllowAllPolicy(event);
        console.log(JSON.stringify(authResponse));

        callback(null, authResponse);
    } catch (err) {

        console.log('Error during authorization' + err);
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
}