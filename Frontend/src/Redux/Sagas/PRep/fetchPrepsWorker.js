import { put, call } from 'redux-saga/effects';
import {
  fetchPrepsSuccess,
  fetchPrepsFailure,
} from '../../Reducers/prepsSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* submitProgressReportWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getPReps',
    });
    yield put(fetchPrepsSuccess(response));
  } catch (error) {
    yield put(fetchPrepsFailure(error));
  }
}

export default submitProgressReportWorker;
