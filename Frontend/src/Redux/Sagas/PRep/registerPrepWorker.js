import { put } from '@redux-saga/core/effects';
import { sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

function* registerPrepWorker({ payload }) {

    sendTransaction({
        method: 'register_prep',
    }
    )

    yield put(
        setBackendTriggerData({
            backendTriggerData: {
            }
        })
    );

}

export default registerPrepWorker;