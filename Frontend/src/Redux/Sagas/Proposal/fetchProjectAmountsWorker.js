import { put, call} from 'redux-saga/effects';
import {fetchProjectAmountsSuccess, fetchProjectAmountsFailure} from '../../Reducers/proposalSlice';
import {callKeyStoreWallet} from '../../ICON/utils';

function* fetchProjectAmountsWorker({payload}) {
  try {
    // const response = yield call(callKeyStoreWallet, {
    //         method: 'get_project_amounts'
    // });

    const response = {_pending:{amount:0x1011,count:0x10},
                        _active:{amount:0x2011,count:0x15} }
    yield put(fetchProjectAmountsSuccess(response));
  } catch (error) {
    yield put(fetchProjectAmountsFailure(error));
  }
}

export default fetchProjectAmountsWorker;