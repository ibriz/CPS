import {BASE_URL, IPFS_URL} from '../Constants';
import { NotificationManager } from 'react-notifications';
import {signTransaction} from 'Redux/ICON/utils';
import store from 'Redux/Store';

async function request({
    url,
    body = {},
    method = "POST",
    signature = null,
    ipfs = false,
    payload = null,
    address = null,
    failureMessage = null,
    requireSigning = false,
    requestSentMessage = null,
    callBackAfterSigning,
    walletAddress = store.getState().account.address, 
    successCallback,
    failureCallback
}) {
    const baseURL = ipfs ? IPFS_URL : BASE_URL;
    console.log("request");

    let headers =  {
        "Content-Type": "application/json",
    }

    if (requireSigning) {

        const {
            signature, 
            payload
          } = await signTransaction(walletAddress);

          if(requestSentMessage) {
              NotificationManager.info(requestSentMessage);
          }

          if(callBackAfterSigning instanceof Function) {
            callBackAfterSigning();
          }

        headers = {
            ...headers,
            signature: signature,
            payload: payload,
            address: walletAddress

        }
    }

    const response = await fetch(`${baseURL}/${url}`, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });

    console.log("response");
    console.log(response);



    const responseJSON = await response.json();

    if (response.status <200 || response.status>400) {
        if (failureCallback instanceof Function) {
            failureCallback(responseJSON.message)
        } else {
            throw new Error(responseJSON.message);

        }

        return;
    }

    if (successCallback instanceof Function) {
        successCallback();
    }
    return responseJSON;
};

async function getRequest({
    url,
    method = "GET",
    ipfs = false
}) {
    const baseURL = ipfs ? IPFS_URL : BASE_URL;
    console.log("request");

    const response = await fetch(`${baseURL}/${url}`, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
    });

    console.log("response");
    console.log(response);

    const responseJSON = await response.json();
    return responseJSON;
};


async function requestIPFS(
    {
        hash
    }
) {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
    const response = await fetch(`https://gateway.ipfs.io/ipfs/${hash}`, requestOptions);
    const responseText = await response.json();
    return responseText;

}

export {
    request,
    requestIPFS,
    getRequest
};

