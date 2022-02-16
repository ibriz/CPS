import { put, call, select } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchSponsorDepositAmountSuccess,
  fetchSponsorDepositAmountFailure,
} from '../../Reducers/fundSlice';

function* fetchSponsorDepositAmountWorker() {
  try {
    const getAddress = state => state.account.address;
    const address = yield select(getAddress);
    const response = yield call(callKeyStoreWallet, {
      method: 'get_sponsors_requests',
      params: {
        _status: '_approved',
        _sponsor_address: address,
      },
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
