import { put, call } from "redux-saga/effects";
import {
  fetchCPFScoreAddressSuccess,
  fetchCPFScoreAddressFailure,
} from "../../Reducers/fundSlice";
import { callKeyStoreWallet } from "../../ICON/utils";

function* fetchCPFScoreAddressWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: "get_cpf_score",
    });

    // const response = {
    //     _current_block: 1000,
    //     _next_block: 10000,
    //     remaining_time: 86500,
    //     _period_name: 'Voting Period'
    // }

    yield put(
      fetchCPFScoreAddressSuccess({
        response,
      })
    );
  } catch (error) {
    yield put(fetchCPFScoreAddressFailure(error));
  }
}

export default fetchCPFScoreAddressWorker;
