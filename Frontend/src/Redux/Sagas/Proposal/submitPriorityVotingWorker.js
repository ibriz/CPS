import { sendTransaction } from 'Redux/ICON/utils';

function * submitPriorityVotingWorker ({ payload }) {
  sendTransaction({
    method: 'votePriority',
    params: { _proposals: payload.proposals },
  });
}

export default submitPriorityVotingWorker;
