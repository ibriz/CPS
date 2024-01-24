import { put, call } from 'redux-saga/effects';
import {
  fetchMaintenanceModeSuccess,
  fetchMaintenanceModeFailure,
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchMaintenanceModeWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getMaintenanceMode',
    });

    console.log('Fetched maintenance mode', response, Boolean(response));

    yield put(
      fetchMaintenanceModeSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchMaintenanceModeFailure(error));
  }
}

export default fetchMaintenanceModeWorker;
