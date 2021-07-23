import { call, put } from "redux-saga/effects";
import {
  fetchProgressReportDetailSuccess,
  fetchProgressReportDetailFailure,
} from "../../Reducers/progressReportSlice";
import { PROPOSAL_ADD_URL } from "../../Constants";
import { requestIPFS } from "../helpers";

function* fetchProgressReportDetailWorker({ payload }) {
  try {
    const response = yield call(requestIPFS, {
      hash: payload.hash,
      //   method: 'GET'
    });
    yield put(
      fetchProgressReportDetailSuccess({
        response,
      })
    );
  } catch (error) {
    yield put(fetchProgressReportDetailFailure(error));
  }
}

export default fetchProgressReportDetailWorker;
