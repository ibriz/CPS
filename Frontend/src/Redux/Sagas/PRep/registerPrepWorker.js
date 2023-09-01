import { put } from '@redux-saga/core/effects';
import { sendTransaction } from 'Redux/ICON/utils';

function* registerPrepWorker({ payload }) {

    sendTransaction({
        method: 'registerPrep',
    }
    )

}

export default registerPrepWorker;
