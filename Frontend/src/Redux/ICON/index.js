import eventHandler from './EventHandler';
import store from '../Store';
import {getCookie} from '../../helpers/cookie';
import {login} from '../Reducers/accountSlice';
import {updateProposalStatus} from '../Reducers/proposalSlice';
// import {callKeyStoreWallet} from './utils';

export const initialSetup = () => {
    window.addEventListener('ICONEX_RELAY_RESPONSE', eventHandler);
    const address = getCookie('wallet_address')

    store.dispatch(login({address}));

    // callKeyStoreWallet(
    //     {
    //         method: 'proposal_details'
    //     }
    // )


}