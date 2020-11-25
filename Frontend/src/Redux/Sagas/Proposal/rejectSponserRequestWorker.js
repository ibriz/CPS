import { sendTransaction } from 'Redux/ICON/utils';

function* rejectSponserRequestWorker({ payload }) {

    const params = {
        _ipfs_key: payload.ipfsKey,
        _vote: '_reject'
    }

    sendTransaction({
        method: 'sponsor_vote',
        params,
    }
    )

    console.log(params);
}

export default rejectSponserRequestWorker;