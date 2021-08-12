import { put, select } from '@redux-saga/core/effects';
import { sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

const voteStatusMapping = {
  Abstain: '_abstain',
  Reject: '_reject',
  Approve: '_approve',
};

export const getAddress = state => state.account.address;

function* voteProposalWorker({ payload }) {

  const walletAddress = yield select(getAddress);

  const params = {
    _vote: voteStatusMapping[payload.vote],
    _vote_reason: payload.voteReason,
    _ipfs_key: payload.ipfsKey,
  };

  sendTransaction({
    method: 'vote_proposal',
    params,
  });

    yield put(
        setBackendTriggerData({
            eventType: "voteProposal",
            data: {
                userAddress: walletAddress,
                proposalIpfsHash: payload.ipfsKey
            }
        })
    );

    console.log(params);
}

export default voteProposalWorker;
