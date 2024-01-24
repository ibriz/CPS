import { sendTransactionFrontendWallet } from 'Redux/ICON/utils';

function* updatePeriodFrontendWalletWorker({ payload }) {
  try {
    sendTransactionFrontendWallet({
      method: 'updatePeriod',
    });
    console.log('success');
  } catch {
    console.log('failure');
  }
}

export default updatePeriodFrontendWalletWorker;
