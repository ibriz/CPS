import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchProgressReportByIpfsFailure,
  fetchProgressReportByIpfsSuccess,
} from '../../Reducers/progressReportSlice';

function* fetchProposalByIpfsWorker({ payload }) {
  try {
    console.log('IPFS payload', payload);
    const response = yield call(callKeyStoreWallet, {
      method: 'get_progress_reports_by_hash',
      params: { _report_key: payload.ipfs_key },
    });
    yield put(
      fetchProgressReportByIpfsSuccess({
        response,
      }),
    );
  } catch (error) {
    console.log('IPFS error', error);
    yield put(fetchProgressReportByIpfsFailure());
  }
}

export default fetchProposalByIpfsWorker;
