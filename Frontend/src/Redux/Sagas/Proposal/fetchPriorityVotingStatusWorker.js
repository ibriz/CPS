import { put, call, select } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchPriorityVotingFailure,
  fetchPriorityVotingSuccess,
} from '../../Reducers/proposalSlice';

function * fetchPriorityVotingStatusWorker ({ payload }) {
  try {
    const getAddress = state => state.account.address;
    const walletAddress = yield select(getAddress);
    const response = yield call(callKeyStoreWallet, {
      method: 'checkPriorityVoting',
      params: {
        _prep: walletAddress,
      },
    });
    yield put(fetchPriorityVotingSuccess(Boolean(Number(response))));
  } catch (error) {
    console.error(error);
    yield put(fetchPriorityVotingFailure());
  }
}

export default fetchPriorityVotingStatusWorker;
