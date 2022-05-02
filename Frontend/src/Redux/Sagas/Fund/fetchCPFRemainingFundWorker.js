import { put, call, select } from 'redux-saga/effects';
import {
  fetchCPFRemainingFundSuccess,
  fetchCPFRemainingFundFailure,
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchCPFRemainingFundWorker({ payload }) {
  try {
    const getCPFTreasuryScoreAddress = state =>
      state.fund.cpfTreasuryScoreAddress;
    const cpfTreasuryAddress = yield select(getCPFTreasuryScoreAddress);

    const dexScoreAddress = yield call(callKeyStoreWallet, {
      method: 'get_dex_score',
      scoreAddress: cpfTreasuryAddress,
    });
    const sicxScoreAddress = yield call(callKeyStoreWallet, {
      method: 'get_sicx_score',
      scoreAddress: cpfTreasuryAddress,
    });
    console.log({ cpfTreasuryAddress });
    console.log({ sicxScoreAddress, dexScoreAddress });

    let response = yield call(callKeyStoreWallet, {
      method: 'get_remaining_fund',
      // scoreAddress: cpfTreasuryScoreAddress
    });

    response.sicx = yield call(callKeyStoreWallet, {
      method: 'balanceOf',
      scoreAddress: sicxScoreAddress,
      params: { _owner: cpfTreasuryAddress },
    });

    response.sicxToICX = yield call(callKeyStoreWallet, {
      scoreAddress: dexScoreAddress,
      method: 'getPrice',
      params: { _id: '1' },
    });

    response.sicxTobnUSD = yield call(callKeyStoreWallet, {
      scoreAddress: dexScoreAddress,
      method: 'getPrice',
      params: { _id: '2' },
    });

    console.log({ response });

    yield put(
      fetchCPFRemainingFundSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchCPFRemainingFundFailure(error));
  }
}

export default fetchCPFRemainingFundWorker;
