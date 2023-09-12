import { CPSScore, sendTransaction, signTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData, setSponsorRequestProposal, setVotingPhase, VotingPhase } from "Redux/Reducers/proposalSlice";
import { put, select } from 'redux-saga/effects';
import store from 'Redux/Store';
import IconService from 'icon-sdk-js';


function* approveSponserRequestWorker({ payload }) {
  const { IconAmount, IconConverter } = IconService;
  yield put(setVotingPhase(VotingPhase.SIGNING));
  const { signature } = yield signTransaction(store.getState().account.address);
  console.log({payload});
  if (signature == '-1' || !signature) {
    return;
  }
  const data = JSON.stringify({
    method: 'sponsor_vote',
    params: {
      ipfs_hash: payload.ipfsKey,
      vote: '_accept',
      vote_reason: payload.reason,
    }
  });
  const getbnUSDAddress = state => state.fund.bnUSDScoreAddress;
  const bnUSDScore = yield select(getbnUSDAddress);
  const params = { '_to': CPSScore, '_value': IconConverter.toHex(IconAmount.of(payload.sponsorBond, IconAmount.Unit.ICX).toLoop()), "_data": IconConverter.toHex(data) }
  yield put(setVotingPhase(VotingPhase.AUTHORIZING));
  sendTransaction({
    method: 'transfer',
    params,
    id: 'approve_sponsor',
    scoreAddress: bnUSDScore
  });
  yield put(setSponsorRequestProposal({ proposal: payload.proposal }));

  yield put(
    setBackendTriggerData({
      projectName: payload.proposal.title,
      address: payload.proposal.contributorAddress,
      sponsorAddress: payload.proposal.sponsorAddress,
      sponsorAction: 'accepted'
    })
  );

  console.log(params);
}

export default approveSponserRequestWorker;
