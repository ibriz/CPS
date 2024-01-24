import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchMigrationProposalByAddressSuccess,
  fetchMigrationProposalByAddressFailure,
} from '../../Reducers/proposalSlice';

const proposalListStatusMapping = {
  Active: '_active',
  Voting: '_pending',
  Pending: '_sponsor_pending',

  Completed: '_completed',
  Disqualified: '_rejected',
  Paused: '_paused',
  Rejected: '_rejected',
};

function* fetchMigrationProposalByAddressWorker({ payload }) {
  try {
    const responseActive = yield call(callKeyStoreWallet, {
      method: 'getActiveProposalsList',
      
    });
    console.log(responseActive);
    yield put(
      fetchMigrationProposalByAddressSuccess({
        response: responseActive,
      }),
    );
  } catch (error) {
    yield put(fetchMigrationProposalByAddressFailure());
  }
}

export default fetchMigrationProposalByAddressWorker;
