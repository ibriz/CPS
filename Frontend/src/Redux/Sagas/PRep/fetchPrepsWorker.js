import { put, call} from 'redux-saga/effects';
import {fetchPrepsSuccess, fetchPrepsFailure} from '../../Reducers/prepsSlice';
import {callKeyStoreWallet} from '../../ICON/utils';

function* submitProgressReportWorker({payload}) {
  try {
    const response = yield call(callKeyStoreWallet, {
            method: 'get_PReps'
    });
    yield put(fetchPrepsSuccess(response));
  } catch (error) {
    yield put(fetchPrepsFailure(error));
  }
}

export default submitProgressReportWorker;