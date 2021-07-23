import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchVoteResultBudgetChangeSuccess,
  fetchVoteResultBudgetChangeFailure,
} from '../../Reducers/progressReportSlice';

function* fetchVoteResultBudgetChangeRequestWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'get_budget_adjustment_vote_result',
      params: {
        _report_key: payload.reportKey,
      },
    });

    yield put(
      fetchVoteResultBudgetChangeSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchVoteResultBudgetChangeFailure());
  }
}

export default fetchVoteResultBudgetChangeRequestWorker;
