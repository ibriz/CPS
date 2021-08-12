import { put } from '@redux-saga/core/effects';
import { sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

function* rejectSponserRequestWorker({ payload }) {
  const params = {
    _ipfs_key: payload.ipfsKey,
    _vote: '_reject',
    _vote_reason: payload.reason,
  };

  sendTransaction({
    method: 'sponsor_vote',
    params,
    id: 'reject_sponsor',
  });

    }

    sendTransaction({
        method: 'sponsor_vote',
        params,
        id: 'reject_sponsor'
    }
    )

    yield put(
        setBackendTriggerData({
            backendTriggerData: {
                _ipfs_key: payload.ipfsKey,
                _vote: '_reject',
                _vote_reason: payload.reason,
            }
        })
    );

    console.log(params);
}

export default rejectSponserRequestWorker;
