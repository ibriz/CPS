import { call, put} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {saveDraftSuccess, saveDraftFailure} from '../../Reducers/proposalSlice';
import {ADD_PROPOSAL_DRAFT_URL} from '../../Constants';
import {request} from '../helpers';
import history from 'Router/history';
import {NotificationManager} from 'react-notifications';
import {signTransaction} from 'Redux/ICON/utils';

function* saveDraftRequestWorker({payload}) {
  // try {

    signTransaction();
  //   let body = {...payload};
  //   Object.keys(body).forEach(key => {
  //       if(body[key] === null || Array.isArray(body[key]) && body[key].length < 1 ) {
  //           delete body[key]
  //       }   
  //   })
  //   const response = yield call(request, {
  //     body: body,
  //     url: ADD_PROPOSAL_DRAFT_URL,
  //     method: body.proposalKey? "PUT": "POST"
  //   });
  //   NotificationManager.success("Draft Succesfully saved")
  //   yield put(saveDraftSuccess(
  //   ));
  // } catch (error) {
  //   NotificationManager.erro("Draft save failed");

  //   yield put(saveDraftFailure());
  // }
}

export default saveDraftRequestWorker;