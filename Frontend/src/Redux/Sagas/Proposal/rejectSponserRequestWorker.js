import { put, select } from '@redux-saga/core/effects';
import { CPSScore, sendTransaction, signTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';
import IconService from 'icon-sdk-js';
import store from 'Redux/Store';

function* rejectSponserRequestWorker({ payload }) {
  const { IconAmount, IconConverter } = IconService;
  const data = JSON.stringify({
    method: 'sponsor_vote',
    params: {
      ipfs_hash: payload.ipfsKey,
      vote: '_reject',
      vote_reason: payload.reason,
    },
  });
  const getbnUSDAddress = state => state.fund.bnUSDScoreAddress;
  const bnUSDScore = yield select(getbnUSDAddress);
  const params = {
    _to: CPSScore,
    _value: IconConverter.toHex(IconAmount.of(0, IconAmount.Unit.ICX).toLoop()),
    _data: IconConverter.toHex(data),
  };

  const { signature } = yield signTransaction(store.getState().account.address);
  if (signature == '-1' || !signature) {
    return;
  }

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
      sponsorAction: 'rejected',
    }),
  );

  console.log(params);
}

export default rejectSponserRequestWorker;
