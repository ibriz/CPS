import { setCookie } from '../../../Helpers/cookie';
import { put } from 'redux-saga/effects';
import { loginPrepRequest } from 'Redux/Reducers/accountSlice';

export default function* signTransactionWorker(payload) {
  try {
    console.log('signTransactionWorker');

    if (payload.payload.signature) {
      setCookie('signature', payload.payload.signature, 12 * 2 * 100);
    }

    // yield put(loginPrepRequest());
  } catch (error) {
    console.log('error');
    // yield put(courseActions.getCourseInfoFailure());
  }
}
