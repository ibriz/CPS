import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchSortPriorityProposalListSuccess,
  fetchSortPriorityProposalListFailure,
} from '../../Reducers/proposalSlice';

function* fetchSortPriorityProposalListWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'sortPriorityProposals',
    });
    console.log({ response });

    let arr = [];
    for (let i = 0; i < response.length; i++) {
      const detailsResopnse = yield call(callKeyStoreWallet, {
        method: 'getProposalDetailsByHash',
        params: { ipfsKey: response[i] },
      });
      arr.push(detailsResopnse);
    }
    yield put(
      fetchSortPriorityProposalListSuccess({
        response: arr,
      }),
    );
  } catch (error) {
    yield put(fetchSortPriorityProposalListFailure());
  }
}

export default fetchSortPriorityProposalListWorker;
