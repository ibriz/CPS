import { put, call, select } from 'redux-saga/effects';
import {
  fetchSponsorBondSuccess,
  fetchSponsorBondFailure,
} from '../../Reducers/fundSlice';
import { callKeyStoreWallet, CPSScore } from '../../ICON/utils';

function* fetchSponsorBondWorker() {
  try {
    const getAddress = state => state.account.address;
    const walletAddress = yield select(getAddress);

    const getIsPrep = state => state.account.isPrep;
    const isPrep = yield select(getIsPrep);

    const getIsRegistered = state => state.account.isRegistered;
    const isRegistered = yield select(getIsRegistered);

    const response = yield call(callKeyStoreWallet, {
      method: 'check_claimable_sponsor_bond',
      params: {
        _address: walletAddress,
      },
      scoreAddress: CPSScore,
    });
    console.log(
      'iscpsTreasuryScoreAddress',
      isPrep,
      isRegistered,
      isPrep && isRegistered,
      response,
    );

    yield put(fetchSponsorBondSuccess(response));
  } catch (error) {
    yield put(fetchSponsorBondFailure(error));
  }
}

export default fetchSponsorBondWorker;
