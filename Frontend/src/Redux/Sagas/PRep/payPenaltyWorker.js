import { sendTransaction } from 'Redux/ICON/utils';
import {payPenaltyAmount} from 'Constants'

function* payPenaltyWorker({ payload }) {

    sendTransaction({
        method: 'pay_prep_penalty',
        icxAmount: payPenaltyAmount
    }
    )

}

export default payPenaltyWorker;