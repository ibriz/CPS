import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchVoteResultBudgetChangeSuccess,
  fetchVoteResultBudgetChangeFailure,
} from '../../Reducers/progressReportSlice';

function* fetchVoteResultBudgetChangeRequestWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getBudgetAdjustmentVoteResult',
      params: {
        reportKey: payload.reportKey,
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
