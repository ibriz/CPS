import { sendTransaction } from 'Redux/ICON/utils';

function* registerPrepWorker({ payload }) {

    sendTransaction({
        method: 'register_prep',
    }
    )

}

export default registerPrepWorker;