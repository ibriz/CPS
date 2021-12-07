import { put, call, select } from 'redux-saga/effects';
import {
  fetchCPFRemainingFundSuccess,
  fetchCPFRemainingFundFailure,
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchCPFRemainingFundWorker({ payload }) {
  try {
    const getCPFScoreAddress = state => state.fund.cpfScoreAddress;
    const cpfScoreAddress = yield select(getCPFScoreAddress);
    const dexScoreAddress = 'cxf0276a2413b46d5660e09c4935eecbf401c5811a';
    const sicxScoreAddress = 'cxcc57144332b23ca8f36d09d862bc202caa76dc30';
    const cpfTreasuryAddress = 'cx075e342b9f7a295c7c672b7228ca6df156e2e360';
    let response = yield call(callKeyStoreWallet, {
      method: 'get_remaining_fund',
      // scoreAddress: cpfScoreAddress
    });

    response.sicx = yield call(callKeyStoreWallet, {
      method: 'balanceOf',
      scoreAddress: sicxScoreAddress,
      params: { _owner: cpfTreasuryAddress }
    })

    response.sicxToICX = yield call(callKeyStoreWallet, {
      scoreAddress: dexScoreAddress,
      method: 'getPrice',
      params: { _id: '1' }
    });

    response.sicxTobnUSD = yield call(callKeyStoreWallet, {
      scoreAddress: dexScoreAddress,
      method: 'getPrice',
      params: { _id: '2' }
    });

    yield put(
      fetchCPFRemainingFundSuccess({
        response
      }),
    );
  } catch (error) {
    yield put(fetchCPFRemainingFundFailure(error));
  }
}

export default fetchCPFRemainingFundWorker;
