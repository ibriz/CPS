import { sendTransaction } from 'Redux/ICON/utils';
import {select} from 'redux-saga/effects';

function* payPenaltyWorker({ payload }) {

    const getPayPenaltyAmount = (state) => state.account.penaltyAmount
    const payPenaltyAmount = yield select(getPayPenaltyAmount);

    sendTransaction({
        method: 'pay_prep_penalty',
        icxAmount: payPenaltyAmount
    }
    )

}

export default payPenaltyWorker;