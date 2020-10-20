import { put, call} from 'redux-saga/effects';
import {fetchPeriodDetailsSuccess, fetchPeriodDetailsFailure} from '../../Reducers/periodSlice';
import {callKeyStoreWallet} from '../../ICON/utils';
import {progressReportStatusMapping} from 'Constants';

function* fetchPeriodDetailsRequestWorker({payload}) {
  try {
      console.log("fetchPeriodDetailsRequestWorker");

//     const response = yield call(callKeyStoreWallet, {
//         method: 'get_period_status'
// });

const response = {
    _current_block: 1000,
    _next_block: 10000,
    _remaining_time: 86500,
    _period: 'Voting Period'
}

console.log("fetchPeriodDetailsRequestWorker3");



    yield put(fetchPeriodDetailsSuccess({
        response
    }));
  } catch (error) {
    yield put(fetchPeriodDetailsFailure(error));
  }
}

export default fetchPeriodDetailsRequestWorker;