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
    const dexScoreAddress = 'cxa0af3165c08318e988cb30993b3048335b94af6c';
    const sicxScoreAddress = 'cx2609b924e33ef00b648a409245c7ea394c467824';
    const cpfTreasuryAddress = 'cxdca1178010b5368aea929ad5c06abee64b91acc2';
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
