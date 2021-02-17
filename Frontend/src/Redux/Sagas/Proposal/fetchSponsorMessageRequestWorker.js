import { put, call} from 'redux-saga/effects';
import {fetchSponsorMessageSuccess, fetchSponsorMessageFailure} from '../../Reducers/proposalSlice';
import {callKeyStoreWallet} from '../../ICON/utils';

function* fetchSponsorMessageRequestWorker({payload}) {
  try {
    const response = yield call(callKeyStoreWallet, {
            method: 'get_sponsor_reasons',
            params: {
              ipfs_key: payload.ipfsKey,          
          }
    });

    yield put(fetchSponsorMessageSuccess(response));
  } catch (error) {
    yield put(fetchSponsorMessageFailure(error));
  }
}

export default fetchSponsorMessageRequestWorker;