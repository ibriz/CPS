import { put } from '@redux-saga/core/effects';
import { sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

function* unregisterPrepWorker({ payload }) {

    sendTransaction({
        method: 'unregister_prep',
    }
    )

    yield put(
        setBackendTriggerData({
            backendTriggerData: {
            }
        })
    );

}

export default unregisterPrepWorker;
