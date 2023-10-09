import { call, put } from 'redux-saga/effects';
import {
  fetchSelectedProposalForProgressReportSuccess,
  fetchSelectedProposalForProgressReportFailure,
} from '../../Reducers/proposalSlice';
import { PROPOSAL_ADD_URL } from '../../Constants';
import { requestIPFS } from '../helpers';

function* fetchSelectedProposalForProgressReportWorker({ payload }) {
  console.log("=============================================fetchSelectedProposalForProgressReportWorker");
  try {
    const response = yield call(requestIPFS, {
      hash: payload.hash,
      //   method: 'GET'
    });
    yield put(
      fetchSelectedProposalForProgressReportSuccess({
        response: {
          ...response,
          ipfsHash: payload.hash,
        },
      }),
    );
  } catch (error) {
    yield put(fetchSelectedProposalForProgressReportFailure(error));
  }
}

export default fetchSelectedProposalForProgressReportWorker;
