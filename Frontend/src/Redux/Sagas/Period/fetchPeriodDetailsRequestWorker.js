import { put, call } from 'redux-saga/effects';
import {
  fetchPeriodDetailsSuccess,
  fetchPeriodDetailsFailure,
} from '../../Reducers/periodSlice';
import { callKeyStoreWallet } from '../../ICON/utils';
import { progressReportStatusMapping } from 'Constants';

function* fetchPeriodDetailsRequestWorker({ payload }) {
  try {
    // console.log("fetchPeriodDetailsRequestWorker");

    const response = yield call(callKeyStoreWallet, {
      method: 'getPeriodStatus',
    });

    // const response = {
    //     current_block: 1000,
    //     next_block: 10000,
    //     remaining_time: 106500,
    //     period_name: 'Voting Period',
    // }

    // console.log("fetchPeriodDetailsRequestWorker3");

    yield put(
      fetchPeriodDetailsSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchPeriodDetailsFailure(error));
  }
}

export default fetchPeriodDetailsRequestWorker;
