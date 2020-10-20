import { call, put} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {submitProgressReportSuccess, submitProgressReportFailure} from '../../Reducers/progressReportSlice';
import {PROGRESS_REPORT_ADD_URL} from '../../Constants';
import {request} from '../helpers';

function* submitProgressReportWorker({payload}) {
  try {

    if(!payload.progressReport.projectTermRevision) {
        payload.progressReport = {
                ...payload.progressReport,
                additionalBudget: null,
                additionalTime: null,
                revisionDescription: null
            }
    }
    const response = yield call(request, {
        body: payload.progressReport,
        url: PROGRESS_REPORT_ADD_URL
      });    
      yield put(submitProgressReportSuccess(
      {
        response,
        progressReport: payload.progressReport
      }
    ));
  } catch (error) {
    yield put(submitProgressReportFailure());
  }
}

export default submitProgressReportWorker;