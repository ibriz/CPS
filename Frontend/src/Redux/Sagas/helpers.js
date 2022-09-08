import { BASE_URL, IPFS_URL } from '../Constants';
import { NotificationManager } from 'react-notifications';
import { signTransaction } from 'Redux/ICON/utils';
import store from 'Redux/Store';

async function request({
  url,
  body = {},
  method = 'POST',
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
  failureCallback,
  baseUrl = BASE_URL,
}) {
  const baseURL = ipfs ? IPFS_URL : baseUrl;
  console.log('request');

  let headers = {
    'Content-Type': 'application/json',
  };

  if (requireSigning) {
    const { signature, payload } = await signTransaction(walletAddress);

    if (signature === -1) {
      throw new Error(-1);
    }

    if (requestSentMessage) {
      NotificationManager.info(requestSentMessage);
    }

    if (callBackAfterSigning instanceof Function) {
      callBackAfterSigning();
    }

    headers = {
      ...headers,
      signature: signature,
      payload: payload,
      address: walletAddress,
    };
  }

  // if payload and signature are supplied, then add payload+signature+address to headers
  if (payload || signature) {
    if (payload == '-1' || signature == '-1' || !payload || !signature) {
      throw new Error('Wallet Signature required');
    }
    headers = {
      ...headers,
      signature,
      payload,
      address: walletAddress,
    };
  }

  const response = await fetch(`${baseURL}/${url}`, {
    method: method,
    headers: headers,
    body: JSON.stringify(body),
  });

  console.log('response');
  console.log(response);

  const responseJSON = await response.json();

  if (response.status < 200 || response.status > 400) {
    if (failureCallback instanceof Function) {
      failureCallback(responseJSON.message);
    } else {
      throw new Error(responseJSON.message);
    }

    return;
  }

  if (successCallback instanceof Function) {
    successCallback();
  }
  return responseJSON;
}

async function getRequest({ url, method = 'GET', ipfs = false }) {
  const baseURL = ipfs ? IPFS_URL : BASE_URL;
  console.log('request');

  const response = await fetch(`${baseURL}/${url}`, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('response');
  console.log(response);

  const responseJSON = await response.json();
  return responseJSON;
}

async function requestIPFS({ hash }) {
  const response = await fetchIPFSRetry(hash);
  return response;
}

const fetchIPFSRetry = async (hash, retries = 3, index = 0) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const ipfsUrlList = [
    'https://cloudflare-ipfs.com/ipfs/{hash}',
    'https://{hash}.ipfs.infura-ipfs.io/',
    'https://gateway.ipfs.io/ipfs/{hash}',
  ];
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
    signal: controller.signal,
  };
  const ipfsUrl = ipfsUrlList[index].replace('{hash}', hash);
  return fetch(ipfsUrl, requestOptions)
    .then(res => {
      clearTimeout(timeoutId);
      if (res.ok) return res.json();
      if (retries > 0) {
        index = index + 1;
        return fetchIPFSRetry(hash, retries - 1, index);
      } else {
        throw new Error('Error while fetching records from IPFS');
      }
    })
    .catch(async error => {
      if (retries > 0) {
        index = index + 1;
        console.log(`Retrying fetchIPFS ${index}`);
        return fetchIPFSRetry(hash, retries - 1, index);
      } else {
        throw error;
      }
    });
};

export { request, requestIPFS, getRequest };
