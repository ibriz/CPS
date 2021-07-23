import { call, put, select } from "redux-saga/effects";
import { getRequest } from "../helpers";
import {
  fetchUserPromptSuccess,
  fetchUserPromptFailure,
} from "Redux/Reducers/userSlice";

function* fetchUserPromptRequestWorker({ payload }) {
  try {
    const getAddress = (state) => state.account.address;
    const address = yield select(getAddress);
    const response = yield call(getRequest, {
      url: `user/prompt?address=${address}`,
      method: "GET",
    });

    yield put(
      fetchUserPromptSuccess({
        response,
      })
    );
  } catch (error) {
    yield put(fetchUserPromptFailure());
  }
}

export default fetchUserPromptRequestWorker;
