import { put, call } from 'redux-saga/effects';
import {
  fetchPeriodCountSuccess,
  fetchPeriodCountFailure,
} from '../../Reducers/periodSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchperiodCountWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getPeriodCount',
    });

    yield put(
      fetchPeriodCountSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchPeriodCountFailure(error));
  }
}

export default fetchperiodCountWorker;
