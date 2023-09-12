import { put, call } from 'redux-saga/effects';
import {
  fetchSponsorBondPercentageSuccess,
  fetchSponsorBondPercentageFailure,
} from '../../Reducers/prepsSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchSponsorBondPercentageWorker() {
  console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getSponsorBondPercentage',
    });
    yield put(fetchSponsorBondPercentageSuccess(response));
  } catch (error) {
    yield put(fetchSponsorBondPercentageFailure(error));
  }
}

export default fetchSponsorBondPercentageWorker;
