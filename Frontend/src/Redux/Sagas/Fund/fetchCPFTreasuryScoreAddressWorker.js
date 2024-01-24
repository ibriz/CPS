import { put, call } from 'redux-saga/effects';
import {
  fetchCPFTreasuryScoreAddressSuccess,
  fetchCPFTreasuryScoreAddressFailure,
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchCPFTreasuryScoreAddressWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getCpfTreasuryScore',
    });

    yield put(
      fetchCPFTreasuryScoreAddressSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchCPFTreasuryScoreAddressFailure(error));
  }
}

export default fetchCPFTreasuryScoreAddressWorker;
