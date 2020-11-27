import { call, put, select} from 'redux-saga/effects';
import {getRequest} from '../helpers';
import {fetchUserDataSuccess, fetchUserDataFailure} from 'Redux/Reducers/userSlice';

function* fetchUserDataRequestWorker({payload}) {
  try {

    const getAddress = (state) => state.account.address
    const address = yield select(getAddress);
    const response = yield call(getRequest, {
      url: `user?address=${address}`,
      method: 'GET'
    });

    // const response = {
    //         "email":"tejpant@gmail.com",
    //         "address":"hx6c8f76faff8d64e43115eb7cbd8aac3a510c1c5d",
    //         "firstName":"Tejasvi Raj",
    //         "lastName":"Pant",
    //         "enableEmailNotifications": true
    //     }
    yield put(fetchUserDataSuccess(
      {
        response,
      }
    ));
  } catch (error) {
    yield put(fetchUserDataFailure());
  }
}


export default fetchUserDataRequestWorker;