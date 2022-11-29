import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import { IconConverter } from 'icon-sdk-js';
import {
  fetchProposalHistorySuccess,
  fetchProposalHistoryFailure,
} from '../../Reducers/proposalSlice';

function* fetchProposalHistoryWorker({ payload }) {
  try {
    // console.log('Calling proposal history list ', payload.startIndex);

    const response = yield call(callKeyStoreWallet, {
      method: 'getProposalsHistory',
      params: {
        startIndex: `${Number(payload?.startIndex) || 0}`,
      },
    });

    const totalCount = IconConverter.toNumber(response.count);
    let fetchedCount = response.data.length;
    while (fetchedCount < totalCount) {
      let temp = yield call(callKeyStoreWallet, {
        method: 'getProposalsHistory',
        params: {
          startIndex: `${Number(fetchedCount) || 0}`,
        },
      });
      fetchedCount += temp.data.length;
      response.data.push(...temp.data);
    }

    yield put(
      fetchProposalHistorySuccess({
        response,
      }),
    );
  } catch (error) {
    console.log('Calling proposal history list error', error);
    yield put(fetchProposalHistoryFailure());
  }
}

export default fetchProposalHistoryWorker;
