import { sendTransaction } from 'Redux/ICON/utils';
import { put, select } from 'redux-saga/effects';

function* claimRewardWorker({ payload }) {
  const getCPSTreasuryScoreAddress = state =>
    state.fund.cpsTreasuryScoreAddress;
  const cpsTreasuryScoreAddress = yield select(getCPSTreasuryScoreAddress);

  sendTransaction({
    method: 'claimReward',
    scoreAddress: cpsTreasuryScoreAddress,
  });
}

export default claimRewardWorker;
