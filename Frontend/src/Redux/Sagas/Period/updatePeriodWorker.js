import { sendTransaction } from 'Redux/ICON/utils';

function* updatePeriodWorker({ payload }) {
  sendTransaction({
    method: 'updatePeriod',
  });
}

export default updatePeriodWorker;
