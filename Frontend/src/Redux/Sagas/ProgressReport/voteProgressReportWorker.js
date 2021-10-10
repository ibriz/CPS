import { put, select } from '@redux-saga/core/effects';
import { sendTransaction, signTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

const getAddress = state => state.account.address;

const voteStatusMapping = {
  Abstain: '_abstain',
  Reject: '_reject',
  Approve: '_approve',
};

function* voteProgressReportWorker({ payload }) {

  const walletAddress = yield select(getAddress);

  const params = {
    _vote: voteStatusMapping[payload.vote],
    _budget_adjustment_vote: voteStatusMapping[payload.voteProjectTermRevision],
    _vote_reason: payload.voteReason,
    _ipfs_key: payload.proposalKey,
    _report_key: payload.reportKey,
  };

  const { signature } =  yield signTransaction(walletAddress);
  
  if(signature == '-1' || !signature) {
    return;
  }

  sendTransaction({
    method: 'vote_progress_report',
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
                progressIpfsHash: payload.reportKey
            }
        })
    );

    console.log(params);
}

export default voteProgressReportWorker;
