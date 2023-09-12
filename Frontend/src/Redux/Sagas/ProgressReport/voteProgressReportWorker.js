import { put, select } from '@redux-saga/core/effects';
import { sendTransaction, signTransaction } from 'Redux/ICON/utils';
import {
  setBackendTriggerData,
  setVotingPhase,
  VotingPhase,
} from 'Redux/Reducers/proposalSlice';

const getAddress = state => state.account.address;

const voteStatusMapping = {
  Abstain: '_abstain',
  Reject: '_reject',
  Approve: '_approve',
};

function* voteProgressReportWorker({ payload }) {
  const walletAddress = yield select(getAddress);

  const params = {
    vote: voteStatusMapping[payload.vote],
    budgetAdjustmentVote: voteStatusMapping[payload.voteProjectTermRevision],
    voteReason: payload.voteReason,
    // ipfs_key: payload.proposalKey,
    reportKey: payload.reportKey,
    voteChange: payload.vote_change,
  };

  yield put(setVotingPhase(VotingPhase.SIGNING));
  const { signature } = yield signTransaction(walletAddress);

  if (signature == '-1' || !signature) {
    return;
  }

  yield put(setVotingPhase(VotingPhase.AUTHORIZING));
  sendTransaction({
    method: 'voteProgressReport',
    params,
  });

  yield put(
    setBackendTriggerData({
      eventType: 'voteProgressReport',
      data: {
        vote: voteStatusMapping[payload.vote],
        userAddress: walletAddress,
        voteReason: payload.voteReason,
        proposalIpfsHash: payload.proposalKey,
        progressIpfsHash: payload.reportKey,
      },
    }),
  );

  console.log(params);
}

export default voteProgressReportWorker;
