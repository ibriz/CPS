import { sendTransaction } from 'Redux/ICON/utils';
import { put, select } from 'redux-saga/effects';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

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