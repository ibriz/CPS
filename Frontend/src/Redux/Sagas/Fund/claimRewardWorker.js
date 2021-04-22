import { sendTransaction } from 'Redux/ICON/utils';
import { select } from 'redux-saga/effects';

function* claimRewardWorker({ payload }) {


    const getCPSTreasuryScoreAddress = (state) => state.fund.cpsTreasuryScoreAddress
    const cpsTreasuryScoreAddress = yield select(getCPSTreasuryScoreAddress);

    sendTransaction({
        method: 'claim_reward',
        scoreAddress: cpsTreasuryScoreAddress

        },

    )

    yield put(
        setBackendTriggerData({
            backendTriggerData: {
            }
        })
    );

}

export default claimRewardWorker;