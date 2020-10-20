import {setCookie} from '../../../helpers/cookie';
import {callKeyStoreWallet} from '../../ICON/utils';
import { put, call} from 'redux-saga/effects';
import {loginSuccess} from 'Redux/Reducers/accountSlice';
import {IconConverter} from 'icon-sdk-js';

export default function* login(payload) {
    try {

      console.log("loginWorker");
      console.log(payload);
  
      if (payload.payload.address) {

        setCookie('wallet_address', payload.payload.address, 12 * 2 * 100);
  
      }

      let response = yield call(callKeyStoreWallet, {
      method: '_login_prep',
      params: {
      _address: payload.payload.address
    
    }
});

    // if(payload.payload.address === 'hx215757b0edf862d2e4c10a0677b4b6944724c724') {
    //   response = '0x01';
    // }
    const isPrep = !!parseInt(IconConverter.toBigNumber(response));

yield put(loginSuccess({
  isPrep
}));



    } catch (error) {
        console.log("error");
      // yield put(courseActions.getCourseInfoFailure());
    }
  }