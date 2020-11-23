import { put, call, select} from 'redux-saga/effects';
import {fetchExpectedGrantSuccess, fetchExpectedGrantFailure} from '../../Reducers/fundSlice';
import {callKeyStoreWallet} from '../../ICON/utils';

function* fetchCPFScoreAddressWorker({payload}) {
  try {

    const getAddress = (state) => state.account.address
    const walletAddress = yield select(getAddress);

    const response = yield call(callKeyStoreWallet, {
        method: 'get_projected_fund',
        params: {
          _wallet_address: walletAddress,
  
        }
});

// const response = {
//     total_amount: '0x100',
//     sponsor_bond: '0x1000'
// }

    yield put(fetchExpectedGrantSuccess({
        response
    }));
  } catch (error) {
    yield put(fetchExpectedGrantFailure(error));
  }
}

export default fetchCPFScoreAddressWorker;