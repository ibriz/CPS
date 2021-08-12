import { put } from 'redux-saga/effects';
import {
  emptyProgressReportDetailSuccess,
  emptyProposalReportDetailFailure,
} from 'Redux/Reducers/progressReportSlice';

function* emptyProgressReportDetailWorker() {
  try {
    yield put(emptyProgressReportDetailSuccess());
  } catch (error) {
    yield put(emptyProposalReportDetailFailure(error));
  }
}

export default emptyProgressReportDetailWorker;
