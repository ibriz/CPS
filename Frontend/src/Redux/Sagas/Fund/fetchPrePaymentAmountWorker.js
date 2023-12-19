import { put, call,select } from 'redux-saga/effects';
import {
  fetchPrePaymentAmountSuccess,
  fetchPrePaymentAmountFailure
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchPrePaymentAmountWorker() {

  const getCPSTreasuryScoreAddress = state =>
    state.fund.cpsTreasuryScoreAddress;
  const cpsTreasuryScoreAddress = yield select(getCPSTreasuryScoreAddress);
  console.log('=======>fetchPrePaymentAmountWorker',cpsTreasuryScoreAddress);
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getOnsetPayment',
      scoreAddress: cpsTreasuryScoreAddress,
    });
    console.log(response)
    yield put(fetchPrePaymentAmountSuccess(response));
  } catch (error) {
    yield put(fetchPrePaymentAmountFailure(error));
  }
  console.log('=======>fetchPrePaymentAmountWorker end')
}

export default fetchPrePaymentAmountWorker;
