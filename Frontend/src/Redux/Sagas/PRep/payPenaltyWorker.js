import { CPSScore, sendTransaction } from 'Redux/ICON/utils';
import { select } from 'redux-saga/effects';
import IconService from 'icon-sdk-js';



function* payPenaltyWorker({ payload }) {
  const getPayPenaltyAmount = state => state.account.unchangedPenaltyAmount;
  const payPenaltyAmount = yield select(getPayPenaltyAmount);
  const { IconAmount, IconConverter } = IconService;
  let _data = JSON.stringify({ "method": "pay_prep_penalty", "params": {} });
  const getbnUSDAddress = state => state.fund.bnUSDScoreAddress;
  const bnUSDScore = yield select(getbnUSDAddress);
  let params = { '_to': CPSScore, '_value': IconConverter.toHex(IconAmount.of(payPenaltyAmount, IconAmount.Unit.ICX).toLoop()), "_data": IconConverter.toHex(_data) }
  sendTransaction({
    method: 'transfer',
    params,
    scoreAddress: bnUSDScore,
    id: 'pay_prep_penalty'
  });
}

export default payPenaltyWorker;
