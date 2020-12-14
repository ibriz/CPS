import { call, put, select} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {submitProposalSuccess, submitProposalFailure} from '../../Reducers/proposalSlice';
import {PROPOSAL_ADD_URL} from '../../Constants';
import {request} from '../helpers';
import {signTransaction} from 'Redux/ICON/utils';

export const getAddress = (state) => state.account.address

function* submitProposalWorker({payload}) {
  try {
    const {
      signature, 
      payload: hash
    } = yield signTransaction();

    const getAddress = (state) => state.account.address
    const walletAddress = yield select(getAddress);

    const address = yield select(getAddress);
    const response = yield call(request, {
      body: {
        ...payload.proposal,
        address,
        type: "proposal"
      },
      url: PROPOSAL_ADD_URL,
      signature: signature,
      payload: hash,
      address: walletAddress
    });
    yield put(submitProposalSuccess(
      {
        response,
        proposal: payload.proposal
      }
    ));
  } catch (error) {
    yield put(submitProposalFailure());
  }
}

export default submitProposalWorker;