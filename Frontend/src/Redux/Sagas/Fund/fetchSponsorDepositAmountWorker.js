import { put, call, select } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchSponsorDepositAmountSuccess,
  fetchSponsorDepositAmountFailure,
  cpsTreasuryAddress,
} from '../../Reducers/fundSlice';

function* fetchSponsorDepositAmountWorker() {
  try {
    const getAddress = state => state.account.address;
    const getCPSTreasuryScoreAddress = state =>
      state.fund.cpsTreasuryScoreAddress;

    const cpsTreasuryAddress = yield select(getCPSTreasuryScoreAddress);
    const address = yield select(getAddress);
    const response = yield call(callKeyStoreWallet, {
      method: 'getSponsorProjectedFund',
      params: {
        walletAddress: address,
      },
      scoreAddress: cpsTreasuryAddress,
    });
    console.log('Fetch sponsor bond', response);
    yield put(
      fetchSponsorDepositAmountSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchSponsorDepositAmountFailure());
  }
}

export default fetchSponsorDepositAmountWorker;
