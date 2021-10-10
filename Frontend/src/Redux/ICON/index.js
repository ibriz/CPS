import eventHandler from './EventHandler';
import store from '../Store';
import { getCookie } from '../../Helpers/cookie';
import { login, signTransaction } from '../Reducers/accountSlice';
import { updateProposalStatus } from '../Reducers/proposalSlice';
// import {callKeyStoreWallet} from './utils';

export const initialSetup = () => {
  window.addEventListener('ICONEX_RELAY_RESPONSE', eventHandler);
  const address = getCookie('wallet_address');
  const signature = getCookie('signature');
  const signatureRawData = getCookie('signatureRawData');
  store.dispatch(login({ address }));
  
  store.dispatch(signTransaction({ signature: signature, signatureRawData: signatureRawData }));

  // callKeyStoreWallet(
  //     {
  //         method: 'proposal_details'
  //     }
  // )
};
