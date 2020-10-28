import { sendTransaction } from 'Redux/ICON/utils';

function* rejectSponserRequestWorker({ payload }) {

    const params = {
        _ipfs_key: payload.ipfsKey,
    }

    sendTransaction({
        method: 'reject_sponsor',
        params,
    }
    )

    console.log(params);
}

export default rejectSponserRequestWorker;