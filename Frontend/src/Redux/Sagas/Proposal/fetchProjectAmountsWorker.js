import { put, call } from 'redux-saga/effects';
import {
  fetchProjectAmountsSuccess,
  fetchProjectAmountsFailure,
} from '../../Reducers/proposalSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchProjectAmountsWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getProjectAmounts',
    });

    // const response = {_pending:{_total_amount:0x1011,_count:0x10},
    //                     _active:{_total_amount:0x2011,_count:0x15} }
    yield put(fetchProjectAmountsSuccess(response));
  } catch (error) {
    yield put(fetchProjectAmountsFailure(error));
  }
}

export default fetchProjectAmountsWorker;
