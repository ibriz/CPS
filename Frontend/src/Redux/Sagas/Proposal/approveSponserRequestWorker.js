import { sendTransaction } from 'Redux/ICON/utils';

function* approveSponserRequestWorker({ payload }) {

    const params = {
        _ipfs_key: payload.ipfsKey,
        _vote: '_accept'
    }

    sendTransaction({
        method: 'sponsor_vote',
        params,
        icxAmount: payload.sponsorBond,
    }
    )

    console.log(params);
}

export default approveSponserRequestWorker;