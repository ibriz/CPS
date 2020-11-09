import { call, put, select} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {submitUserDataSuccess, submitUserDataFailure, fetchUserDataRequest} from '../../Reducers/userSlice';
import {SUBMIT_USER_DATA_URL} from '../../Constants';
import {request} from '../helpers';

export const getAddress = (state) => state.account.address

function* submitUserDataRequestWorker({payload}) {
  try {
    const address = yield select(getAddress);
    const response = yield call(request, {
      body: {
        email: payload.userData.email,
        enableEmailNotifications: payload.userData.enableEmailNotifications,
        firstName: payload.userData.firstName,
        lastName: payload.userData.lastName,
        address,
      },
      url: SUBMIT_USER_DATA_URL
    });
    yield put(submitUserDataSuccess(
    ));
    yield put(fetchUserDataRequest());
  } catch (error) {
    yield put(submitUserDataFailure());
  }
}

export default submitUserDataRequestWorker;