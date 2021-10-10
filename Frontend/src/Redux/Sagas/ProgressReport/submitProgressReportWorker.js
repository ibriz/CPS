import { call, put, select } from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  submitProgressReportSuccess,
  submitProgressReportFailure,
  setSubmittingProgressReport,
} from '../../Reducers/progressReportSlice';
import { PROGRESS_REPORT_ADD_URL } from '../../Constants';
import { request } from '../helpers';
import store from 'Redux/Store';
import { signTransaction } from 'Redux/ICON/utils';
import { NotificationManager } from 'react-notifications';

export const getAddress = state => state.account.address;

function* submitProgressReportWorker({ payload }) {
  try {
    if (!payload.progressReport.projectTermRevision) {
      payload.progressReport = {
        ...payload.progressReport,
        additionalBudget: null,
        additionalTime: null,
        revisionDescription: null,
      };
    }
    const address = yield select(getAddress);

    yield signTransaction(address);

    const response = yield call(request, {
      body: {
        ...payload.progressReport,
        address,
        type: 'report',
      },
      url: PROGRESS_REPORT_ADD_URL,
      signature: store.getState().account.signature,
      payload: store.getState().account.signatureRawData,
      callBackAfterSigning: () =>
        store.dispatch(setSubmittingProgressReport(true)),
    });
    yield put(
      submitProgressReportSuccess({
        response,
        progressReport: payload.progressReport,
      }),
    );
  } catch (error) {
    if (error.message === '-1') {
      return;
    }
    NotificationManager.error(error.message, 'Submit Progress Report Failed');
    yield put(submitProgressReportFailure());
  }
}

export default submitProgressReportWorker;
