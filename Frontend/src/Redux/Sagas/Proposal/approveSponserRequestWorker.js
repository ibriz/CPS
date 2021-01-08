import { sendTransaction } from 'Redux/ICON/utils';

function* approveSponserRequestWorker({ payload }) {

    const params = {
        _ipfs_key: payload.ipfsKey,
        _vote: '_accept',
        _vote_reason: payload.reason,
    }

    sendTransaction({
        method: 'sponsor_vote',
        params,
        icxAmount: payload.sponsorBond,
        id: 'approve_sponsor'
    }
    )

    console.log(params);
}

export default approveSponserRequestWorker;