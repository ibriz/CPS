import { put, call, select} from 'redux-saga/effects';
import {fetchCPFRemainingFundSuccess, fetchCPFRemainingFundFailure} from '../../Reducers/fundSlice';
import {callKeyStoreWallet} from '../../ICON/utils';

function* fetchCPFRemainingFundWorker({payload}) {
  try {

    const getCPFScoreAddress = (state) => state.fund.cpfScoreAddress
    const cpfScoreAddress = yield select(getCPFScoreAddress);

    const response = yield call(callKeyStoreWallet, {
        method: 'get_total_fund',
        scoreAddress: cpfScoreAddress
});


    yield put(fetchCPFRemainingFundSuccess({
        response
    }));
  } catch (error) {
    yield put(fetchCPFRemainingFundFailure(error));
  }
}

export default fetchCPFRemainingFundWorker;