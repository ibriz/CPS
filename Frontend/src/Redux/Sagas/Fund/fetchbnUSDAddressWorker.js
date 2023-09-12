import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
    fetchbnUSDAddressSuccess, fetchbnUSDAddressFailure,
} from '../../Reducers/fundSlice';

function* fetchbnUSDScoreWorker() {
    try {
        const response = yield call(callKeyStoreWallet, {
            method: 'getBnusdScore'
        });
        yield put(
            fetchbnUSDAddressSuccess(
                response,
            ),
        );
    } catch (error) {
        console.log('bnUSD error', error);
        yield put(fetchbnUSDAddressFailure());
    }
}

export default fetchbnUSDScoreWorker;
