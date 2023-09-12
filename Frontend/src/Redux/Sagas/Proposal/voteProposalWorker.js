import { put, select } from '@redux-saga/core/effects';
import { sendTransaction, signTransaction } from 'Redux/ICON/utils';
import {
  setBackendTriggerData,
  setVotingPhase,
  VotingPhase,
} from 'Redux/Reducers/proposalSlice';
import store from 'Redux/Store';

const voteStatusMapping = {
  Abstain: '_abstain',
  Reject: '_reject',
  Approve: '_approve',
};

export const getAddress = state => state.account.address;

function* voteProposalWorker({ payload }) {
  const walletAddress = yield select(getAddress);

  const params = {
    vote: voteStatusMapping[payload.vote],
    vote_reason: payload.voteReason,
    ipfs_key: payload.ipfsKey,
    // _vote_change: payload.vote_change,
  };

  yield put(setVotingPhase(VotingPhase.SIGNING));
  const { signature } = yield signTransaction(walletAddress);

  if (signature == '-1' || !signature) {
    return;
  }

  sendTransaction({
    method: 'voteProposal',
    params,
  });

  yield put(setVotingPhase(VotingPhase.AUTHORIZING));
  yield put(
    setBackendTriggerData({
      eventType: 'voteProposal',
      data: {
        userAddress: walletAddress,
        proposalIpfsHash: payload.ipfsKey,
      },
    }),
  );
  console.log(params);
}

export default voteProposalWorker;
