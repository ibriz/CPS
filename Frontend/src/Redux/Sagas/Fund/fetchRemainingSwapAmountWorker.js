import { put, call, select } from 'redux-saga/effects';
import {
  fetchRemainingSwapAmountSuccess,
  fetchRemainingSwapAmountFailure,
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchRemainingSwapAmountWorker({ payload }) {
  try {
    // const cpfTreasuryAddress = 'cxa1e86a85b19f93c45d335709909f93afb4c40aac';

    const getCPFTreasuryScoreAddress = state =>
      state.fund.cpfTreasuryScoreAddress;
    const cpfTreasuryAddress = yield select(getCPFTreasuryScoreAddress);
    console.log({ cpfTreasuryAddress });
    const response = yield call(callKeyStoreWallet, {
      method: 'getRemainingSwapAmount',
      scoreAddress: cpfTreasuryAddress,
    });

    yield put(
      fetchRemainingSwapAmountSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchRemainingSwapAmountFailure(error));
  }
}

export default fetchRemainingSwapAmountWorker;
