import store from '../../Store';
import { sendTransaction } from '../../ICON/utils';

function* updateProposalStatusWorker({ payload }) {
  console.log('updateProposalStatusWorker');
  console.log(payload);

  const params = {
    _ipfs_key: payload.ipfsKey,
    _status: payload.status,
  };

  sendTransaction({
    method: 'update_proposal_status',
    params,
    icxAmount: 0,
  });

  console.log(params);
  //     const response = yield call(submitProposal, payload.proposal);
  //     yield put(submitProposalSuccess(
  //       {
  //         response,
  //         proposal: payload.proposal
  //       }
  //     ));
  //   } catch (error) {
  //     yield put(submitProposalFailure());
  //   }
}

export default updateProposalStatusWorker;
