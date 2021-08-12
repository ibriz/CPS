import { sendTransaction } from 'Redux/ICON/utils';

function* updatePeriodWorker({ payload }) {
  sendTransaction({
    method: 'update_period',
  });
}

export default updatePeriodWorker;
