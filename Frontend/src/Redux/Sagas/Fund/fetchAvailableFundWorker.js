import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchAvailableFundFailure,
  fetchAvailableFundSuccess,
} from '../../Reducers/fundSlice';

function* fetchAvailableFundWorker() {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getRemainingFund',
    });
    yield put(fetchAvailableFundSuccess(response));
  } catch (error) {
    console.log('Proposal fund error', error);
    yield put(fetchAvailableFundFailure());
  }
}

export default fetchAvailableFundWorker;
