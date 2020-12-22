import { call, put} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {saveDraftSuccess, saveDraftFailure} from '../../Reducers/progressReportSlice';
import {ADD_PROGRESS_REPORT_DRAFT_URL} from '../../Constants';
import {request} from '../helpers';
import history from 'Router/history';
import {NotificationManager} from 'react-notifications';
import {signTransaction} from 'Redux/ICON/utils';

function* saveDraftRequestWorker({payload}) {
  try {
    // const signature = yield signTransaction();
    let body = {...payload,
      type: "ProgressReport",
    proposalName: payload.proposalName,
  progressReportName: payload.progressReportTitle};
    Object.keys(body).forEach(key => {
        if(body[key] === null || Array.isArray(body[key]) && body[key].length < 1 ) {
            delete body[key]
        }   
    })
    const response = yield call(request, {
      body: body,
      // signature: signature,
      url: ADD_PROGRESS_REPORT_DRAFT_URL,
      method: body.ipfsKey? "PUT": "POST",
      requireSigning: true,
      requestSentMessage: "Draft Save Request Sent",
      callBackAfterSigning: payload.callBackAfterSigning

    });
    NotificationManager.success("Draft Succesfully saved")
    yield put(saveDraftSuccess(
    ));
  } catch (error) {
    NotificationManager.error(error.message, "Draft save failed");

    yield put(saveDraftFailure());
  }
}

export default saveDraftRequestWorker;