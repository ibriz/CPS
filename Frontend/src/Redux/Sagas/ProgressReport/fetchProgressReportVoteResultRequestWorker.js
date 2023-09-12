import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchVoteResultSuccess,
  fetchVoteResultFailure,
} from '../../Reducers/progressReportSlice';

function* fetchProposalVoteResultRequestWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getProgressReportResult',
      params: {
        reportKey: payload.reportKey,
      },
    });

    yield put(
      fetchVoteResultSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchVoteResultFailure());
  }
}

export default fetchProposalVoteResultRequestWorker;
