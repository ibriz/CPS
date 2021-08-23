import { put } from '@redux-saga/core/effects';
import { bnUSDScore, CPSScore, sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';
import IconService from 'icon-sdk-js';


function* rejectSponserRequestWorker({ payload }) {
  const { IconAmount, IconConverter } = IconService;
  const data = JSON.stringify({
    method: 'sponsor_vote',
    params: {
      ipfs_hash: payload.ipfsKey,
      vote: '_reject',
      vote_reason: payload.reason,
    }
  });

  const params = { '_to': CPSScore, '_value': IconConverter.toHex(IconAmount.of(0, IconAmount.Unit.ICX).toLoop()), "_data": IconConverter.toHex(data) }

  sendTransaction({
    method: 'transfer',
    params,
    scoreAddress: bnUSDScore,
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
