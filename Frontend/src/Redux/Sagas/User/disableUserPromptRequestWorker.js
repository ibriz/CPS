import { call, put, select } from "redux-saga/effects";
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  disableUserPromptSuccess,
  disableUserPromptFailure,
  fetchUserPromptRequest,
} from "../../Reducers/userSlice";
import { USER_PROMPT } from "../../Constants";
import { request } from "../helpers";
import { NotificationManager } from "react-notifications";

export const getAddress = (state) => state.account.address;

function* disableUserPromptRequestWorker({ payload }) {
  try {
    const address = yield select(getAddress);
    const response = yield call(request, {
      body: {
        address,
      },
      url: USER_PROMPT,
    });
    yield put(disableUserPromptSuccess());
    // NotificationManager.success("User Data Updated Successfully");

    try {
      yield put(fetchUserPromptRequest());
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    // NotificationManager.error(error.message, "User Data Update Failed");
    yield put(disableUserPromptFailure());
  }
}

export default disableUserPromptRequestWorker;
