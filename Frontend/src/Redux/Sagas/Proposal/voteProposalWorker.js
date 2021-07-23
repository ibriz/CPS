import { sendTransaction } from 'Redux/ICON/utils';

const voteStatusMapping = {
  Abstain: '_abstain',
  Reject: '_reject',
  Approve: '_approve',
};

function* voteProposalWorker({ payload }) {
  const params = {
    _vote: voteStatusMapping[payload.vote],
    _vote_reason: payload.voteReason,
    _ipfs_key: payload.ipfsKey,
  };

  sendTransaction({
    method: 'vote_proposal',
    params,
  });

  console.log(params);
}

export default voteProposalWorker;
