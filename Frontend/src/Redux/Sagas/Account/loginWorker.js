import { setCookie } from '../../../helpers/cookie';
import { callKeyStoreWallet } from '../../ICON/utils';
import { put, call } from 'redux-saga/effects';
import { loginSuccess, loginPrepRequest } from 'Redux/Reducers/accountSlice';
import { IconConverter } from 'icon-sdk-js';

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