import { setCookie } from '../../../Helpers/cookie';
import { put } from 'redux-saga/effects';
import { loginPrepRequest } from 'Redux/Reducers/accountSlice';

export default function* login(payload) {
  try {

    console.log("loginWorker");
    console.log(payload);

    if (payload.payload.address) {

      setCookie('wallet_address', payload.payload.address, 12 * 2 * 100);

    }

    yield put(loginPrepRequest());



  } catch (error) {
    console.log("error");
    // yield put(courseActions.getCourseInfoFailure());
  }
}