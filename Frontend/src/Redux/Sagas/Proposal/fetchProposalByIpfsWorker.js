import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
import {
  fetchProposalByIpfsFailure,
  fetchProposalByIpfsSuccess,
} from '../../Reducers/proposalSlice';

function* fetchProposalByIpfsWorker({ payload }) {
  try {
    console.log('IPFS payload', payload);
    const response = yield call(callKeyStoreWallet, {
      method: 'getProposalDetailsByHash',
      params: { ipfsKey: payload.ipfs_key },
    });
    yield put(
      fetchProposalByIpfsSuccess({
        response,
      }),
    );
  } catch (error) {
    console.log('IPFS error', error);
    yield put(fetchProposalByIpfsFailure());
  }
}

export default fetchProposalByIpfsWorker;
