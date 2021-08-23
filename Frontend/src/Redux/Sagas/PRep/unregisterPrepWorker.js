import { put } from '@redux-saga/core/effects';
import { sendTransaction } from 'Redux/ICON/utils';

function* unregisterPrepWorker({ payload }) {

    sendTransaction({
        method: 'unregister_prep',
    }
    )

}

export default unregisterPrepWorker;
