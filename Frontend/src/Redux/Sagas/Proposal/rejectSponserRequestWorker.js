import { put } from '@redux-saga/core/effects';
import { sendTransaction, signTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';
import store from 'Redux/Store';

function* rejectSponserRequestWorker({ payload }) {
  const params = {
    _ipfs_key: payload.ipfsKey,
    _vote: '_reject',
    _vote_reason: payload.reason,
  };

  const { signature } = yield signTransaction(store.getState().account.address);

  if(signature == '-1' || !signature) {
    return;
  }

  sendTransaction({
    method: 'sponsor_vote',
    params,
    id: 'reject_sponsor',
  });

  yield put(
    setBackendTriggerData({
            projectName: payload.proposal.title,
            address: payload.proposal.contributorAddress,
            sponsorAddress: payload.proposal.sponsorAddress,
            sponsorAction: 'rejected'
        })
);

    console.log(params);
}

export default rejectSponserRequestWorker;
