import { call, put} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {submitProposalSuccess, submitProposalFailure} from '../../Reducers/proposalSlice';
import {PROPOSAL_ADD_URL} from '../../Constants';
import {request} from '../helpers';

function* submitProposalWorker({payload}) {
  try {
    const response = yield call(request, {
      body: payload.proposal,
      url: PROPOSAL_ADD_URL
    });
    yield put(submitProposalSuccess(
      {
        response,
        proposal: payload.proposal
      }
    ));
  } catch (error) {
    yield put(submitProposalFailure());
  }
}

export default submitProposalWorker;