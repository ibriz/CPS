import { sendTransaction } from 'Redux/ICON/utils';

function* claimRewardWorker({ payload }) {

    sendTransaction({
        method: 'claim_reward',
    }
    )

}

export default claimRewardWorker;