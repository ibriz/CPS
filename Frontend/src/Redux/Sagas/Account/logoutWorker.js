import {setCookie} from '../../../helpers/cookie';

export default function* logout() {
    try {
  
        setCookie('wallet_address', '', 12 * 2 * 100);
        setCookie('signature', '', 12 * 2 * 100);

  
    } catch (error) {
        console.log("error");
      // yield put(courseActions.getCourseInfoFailure());
    }
  }