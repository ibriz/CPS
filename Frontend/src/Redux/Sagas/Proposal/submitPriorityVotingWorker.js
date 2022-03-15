import { sendTransaction } from "Redux/ICON/utils";

function* submitPriorityVotingWorker({ payload }) {
     sendTransaction({
      method: 'vote_priority',
      params:{_proposals:payload.proposals},
    })
}

export default submitPriorityVotingWorker;
