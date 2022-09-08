import { call, put } from 'redux-saga/effects';
import {
  fetchProposalDetailSuccess,
  fetchProposalDetailFailure,
} from '../../Reducers/proposalSlice';
import { PROPOSAL_ADD_URL } from '../../Constants';
import { requestIPFS } from '../helpers';

function* fetchProposalDetailWorker({ payload }) {
  try {
    const response = yield call(requestIPFS, {
      hash: payload.hash,
      //   method: 'GET'
    });
    yield put(
      fetchProposalDetailSuccess({
        response: {
          ...response,
          ipfsHash: payload.hash,
        },
      }),
    );
  } catch (error) {
    yield put(fetchProposalDetailFailure(error));
  }
}

export default fetchProposalDetailWorker;
