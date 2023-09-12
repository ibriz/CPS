import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchChangeVoteFailure,
  fetchChangeVoteSuccess,
} from '../../Reducers/progressReportSlice';

function* fetchChangeVoteWorker({ payload }) {
  try {
    console.log('Change Vote payload', payload);
    const response = yield call(callKeyStoreWallet, {
      method: 'checkChangeVote',
      params: {
        ipfsHash: payload.ipfs_key,
        address: payload.address,
        proposalType: 'progress_report',
      },
    });
    yield put(
      fetchChangeVoteSuccess({
        response,
      }),
    );
  } catch (error) {
    console.log('IPFS error', error);
    yield put(fetchChangeVoteFailure());
  }
}

export default fetchChangeVoteWorker;
