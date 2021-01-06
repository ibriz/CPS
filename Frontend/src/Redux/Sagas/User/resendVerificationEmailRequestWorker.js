import { call, put, select} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {resendVerificationEmailSuccess, resendVerificationEmailFailure, fetchUserDataRequest} from '../../Reducers/userSlice';
import {RESEND_EMAIL_VERIFICATION} from '../../Constants';
import {request} from '../helpers';
import {NotificationManager} from 'react-notifications';

export const getAddress = (state) => state.account.address

function* resendVerificationEmailRequestWorker({payload}) {
  try {
    const address = yield select(getAddress);
    const response = yield call(request, {
      body: {
        address,
      },
      url: RESEND_EMAIL_VERIFICATION,
    //   requireSigning: true
    });
    yield put(resendVerificationEmailSuccess(
    ));
    NotificationManager.success("Verification Email Re-sent");

    // try {
    //   yield put(fetchUserDataRequest());
    // } catch(error) {
    //   console.log(error);
    // }
  } catch (error) {
    NotificationManager.error(error.message, "Verification Email Re-sent Failed");
    yield put(resendVerificationEmailFailure());

  }
}

export default resendVerificationEmailRequestWorker;