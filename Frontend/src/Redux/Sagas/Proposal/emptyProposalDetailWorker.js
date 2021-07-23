import { put} from 'redux-saga/effects';
import {emptyProposalDetailSuccess, emptyProposalDetailFailure} from '../../Reducers/proposalSlice';

function* emptyProposalDetailWorker() {
  try {
    yield put(emptyProposalDetailSuccess());
  } catch (error) {
    yield put(emptyProposalDetailFailure(error));
  }
}

export default emptyProposalDetailWorker;