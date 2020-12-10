import { put, call, select } from 'redux-saga/effects';
import { fetchExpectedGrantSuccess, fetchExpectedGrantFailure } from '../../Reducers/fundSlice';
import { callKeyStoreWallet } from '../../ICON/utils';

function* fetchCPFScoreAddressWorker({ payload }) {
  try {

    const getAddress = (state) => state.account.address
    const walletAddress = yield select(getAddress);

    const getCPSTreasuryScoreAddress = (state) => state.fund.cpsTreasuryScoreAddress
    const cpsTreasuryScoreAddress = yield select(getCPSTreasuryScoreAddress);

    const getIsPrep = (state) => state.account.isPrep;
    const isPrep = yield select(getIsPrep);

    const getIsRegistered = (state) => state.account.isRegistered;
    const isRegistered = yield select(getIsRegistered);


    console.log("cpsTreasuryScoreAddress",cpsTreasuryScoreAddress);
    if (cpsTreasuryScoreAddress) {
      const response = yield call(callKeyStoreWallet, {
        method: (isPrep && isRegistered) ? 'get_sponsor_projected_fund' : 'get_contributor_projected_fund',
        params: {
          _wallet_address: walletAddress,

        },
        scoreAddress: cpsTreasuryScoreAddress

      });
      console.log("iscpsTreasuryScoreAddress", isPrep, isRegistered, isPrep && isRegistered, response)

      yield put(fetchExpectedGrantSuccess({
        response: {
          ...response,
        }
      }));
    }
  } catch (error) {
    yield put(fetchExpectedGrantFailure(error));
  }
}

export default fetchCPFScoreAddressWorker;