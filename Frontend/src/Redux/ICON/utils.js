import { IconBuilder, HttpProvider, SignedTransaction } from 'icon-sdk-js';
import IconService from 'icon-sdk-js';
import ids from './constants.js';
import store from '../Store';
import { customRequestRPC } from './CustomEvents';
import constants from './constants';
import { signTransaction as signTransactionRequest } from 'Redux/Reducers/accountSlice';
import frontEndWallet from './FrontEndWallet';

// Mainnet Envs
// export const CPSScore = 'cx9f4ab72f854d3ccdc59aa6f2c3e2215dd62e879f';
// var nid = 1;
// export const provider = new HttpProvider('https://ctz.solidwallet.io/api/v3');
// export const trackerURL = 'https://tracker.icon.community/address';

// Testnet Envs Berlin
// export const CPSScore = 'cx2fb89997316a8f0d73003c0bb829af319d0df717';
// var nid = 7;
// export const trackerURL = 'https://tracker.berlin.icon.community/address';
// export const provider = new HttpProvider('https://berlin.net.solidwallet.io/api/v3');

// Testnet Envs Lisbon
export const CPSScore = 'cx8e7b5c925a0e72f79ff1161a3e74a86da78934d5';
var nid = 2;
export const provider = new HttpProvider(
  'https://lisbon.net.solidwallet.io/api/v3',
);
export const trackerURL = 'https://tracker.lisbon.icon.community/address';

export const iconService = new IconService(provider);

export function call({ scoreAddress = CPSScore, method, params = {}, id }) {
  let callBuilder = new IconBuilder.CallBuilder();
  let call = callBuilder.to(scoreAddress).method(method).params(params).build();

  let jsonRpc = JSON.stringify({
    jsonrpc: '2.0',
    method: 'icx_call',
    params: call,
    id: ids.method,
  });

  window.dispatchEvent(customRequestRPC(jsonRpc));
}

// export const hasWalletParticipated = async () => {
//   return new Promise(async (resolve, reject) => {
//     let callBuilder = new IconBuilder.CallBuilder();
//       try {
//           const call = callBuilder
//               .to(CPSScore)
//               .method("getMilestoneVoteResult")
//               .params({
//                 reportKey: `bafybeifrvpj33rmqbrrzqq3pbbsyhxsatctq67arsq6mawv7z6ttpod3mq`,
//                 milestoneID:`0x${Number(65720).toString(16)}`
//               })
//               .build();
//           const status = await iconService.call(call).execute();
//           resolve(status);
//       } catch (e) {
//           console.log(e);
//           resolve(0);
//       }
//   });
// };

export async function callKeyStoreWallet({
  scoreAddress = CPSScore,
  method,
  params = {},
}) {
  // console.log("check in callkeystore",scoreAddress,method,params)
  // console.log("cpsTreasuryScoreAddressKeyStore", scoreAddress);
  let callBuilder = new IconBuilder.CallBuilder();

  let call = callBuilder.to(scoreAddress).method(method).params(params).build();

  // const provider = new HttpProvider('https://zicon.net.solidwallet.io/api/v3');
  // console.log("callKeyStoreWallet start");
  const response = await iconService.call(call).execute();
  // console.log("callKeyStoreWallet");
  // console.log("response of the callkeystore",response);
  return response;
}

export function sendTransaction({
  fromAddress = store.getState().account.address,
  scoreAddress = CPSScore,
  icxAmount = 0,
  method,
  params = {},
  id = null,
}) {
  const { IconConverter, IconBuilder, IconAmount } = IconService;
  const txnBuilder = new IconBuilder.CallTransactionBuilder();
  const txnData = txnBuilder
    .from(fromAddress)
    .to(scoreAddress)
    .nid(IconConverter.toBigNumber(nid))
    .timestamp(new Date().getTime() * 1000)
    .stepLimit(IconConverter.toBigNumber(4000000000))
    .version(IconConverter.toBigNumber(3))
    .method(method)
    .params(params)
    .value(IconAmount.of(icxAmount, IconAmount.Unit.ICX).toLoop())
    .build();

  const txnPayload = {
    jsonrpc: '2.0',
    method: 'icx_sendTransaction',
    params: IconConverter.toRawTransaction(txnData),
    id: id ? `${constants[id]}` : `${constants[method]}`,
  };
  console.log('-----------------txnPayload----------------', txnPayload);
  window.parent.dispatchEvent(
    new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_JSON-RPC',
        payload: txnPayload,
      },
    }),
  );
}

export async function sendTransactionFrontendWallet({
  fromAddress = frontEndWallet.getAddress(),
  scoreAddress = CPSScore,
  wallet = frontEndWallet,
  icxAmount = 0,
  method,
  params,
  id = null,
}) {
  const { IconConverter, IconBuilder, IconAmount } = IconService;
  const txnBuilder = new IconBuilder.CallTransactionBuilder();
  const txnData = txnBuilder
    .from(fromAddress)
    .to(scoreAddress)
    .nid(IconConverter.toBigNumber(nid))
    .timestamp(new Date().getTime() * 1000)
    .stepLimit(IconConverter.toBigNumber(100000000))
    .version(IconConverter.toBigNumber(3))
    .method(method)
    .params(params)
    .value(IconAmount.of(icxAmount, IconAmount.Unit.ICX).toLoop())
    .build();

  await iconService
    .sendTransaction(new SignedTransaction(txnData, wallet))
    .execute();
}

export function signTransaction(walletAddress) {
  return new Promise((resolve, reject) => {
    //   const signature = store.getState().account.signature;
    //   if (signature) {
    //       resolve(signature);
    //       return;
    //   }
    store.dispatch(
      signTransactionRequest({ signature: null, signatureRawData: null }),
    );

    const payload = getRanHex(51) + new Date().getTime();
    signTransactionFromICONEX(payload, walletAddress);

    let interFunctionHandle = null;

    const interFunction = () => {
      const signature = store.getState().account.signature;
      if (signature) {
        clearInterval(interFunctionHandle);
        if (signature === '-1') {
          resolve({
            signature: -1,
            payload: -1,
          });
        }
        store.dispatch(
          signTransactionRequest({ signature, signatureRawData: payload }),
        );
        resolve({
          signature,
          payload,
        });
        return;
      }
    };

    interFunctionHandle = setInterval(interFunction, 100);
  });
}

function getRanHex(size) {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

export function signTransactionFromICONEX(hash, walletAddress) {
  window.parent.dispatchEvent(
    new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: 'REQUEST_SIGNING',
        payload: {
          from: walletAddress,
          // hash: "9babe5d2911e8e42dfad72a589202767f95c6fab49523cdc1621607529890125", //64 characters
          hash: hash,
        },
      },
    }),
  );
}
