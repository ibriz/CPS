const secp = require('secp256k1');
var ethUtil = require('ethereumjs-util');
var sha3_256 = require('js-sha3').sha3_256;

function validateSignature(signature, address, payload) {
    const signatureArray = Buffer.from(signature, 'base64');

    const signatureBuffer = signatureArray.subarray(0, 64);

    const recoveryBuffer = signatureArray.subarray(64);

    const publicKey = secp.ecdsaRecover(signatureBuffer,
        parseInt(recoveryBuffer.toString('hex')),
        new Uint8Array(Buffer.from(payload, 'hex')),
        false);

    const pubKey = ethUtil.toBuffer(publicKey.slice(1));

    console.log(pubKey.length);

    console.log(sha3_256(pubKey).slice(-40))

    const decodedAddress = 'hx' + sha3_256(pubKey).slice(-40);

    return address === decodedAddress;
}

function buildAllowAllPolicy(event) {
    const policy = {
        "principalId": 'user',
        "policyDocument": {
            "Version": '2012-10-17',
            "Statement": [
                {
                    "Action": 'execute-api:Invoke',
                    "Effect": 'Allow',
                    "Resource": event.methodArn
                }
            ]
        }
    }

    return policy;
}

exports.handler = function (event, context, callback) {
    console.log(event);

    const { signature, address, payload } = event.headers;

    if (!(signature && address && payload)) return callback('Unauthorized');
    if (!validateSignature(signature, address, payload)) return callback('Unauthorized');

    const authResponse = buildAllowAllPolicy(event);

    console.log(JSON.stringify(authResponse));

    callback(null, authResponse);
}