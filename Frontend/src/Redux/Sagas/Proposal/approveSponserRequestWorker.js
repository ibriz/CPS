import { sendTransaction } from 'Redux/ICON/utils';

function* approveSponserRequestWorker({ payload }) {

    const params = {
        _ipfs_key: payload.ipfsKey,
    }

    sendTransaction({
        method: '_approve_sponsor',
        params,
        icxAmount: payload.sponsorBond,
    }
    )

    console.log(params);
}

export default approveSponserRequestWorker;