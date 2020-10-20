import {BASE_URL, IPFS_URL} from '../Constants';

async function request({
    url,
    body = {},
    method = "POST",
    ipfs = false
}) {
    const baseURL = ipfs ? IPFS_URL : BASE_URL;
    console.log("request");

    const response = await fetch(`${baseURL}/${url}`, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    console.log("response");
    console.log(response);

    const responseJSON = await response.json();
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

