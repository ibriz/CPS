import { call, put, select} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {submitProposalSuccess, submitProposalFailure, setSubmittingProposal} from '../../Reducers/proposalSlice';
import {PROPOSAL_ADD_URL} from '../../Constants';
import {request} from '../helpers';
import {signTransaction} from 'Redux/ICON/utils';
import store from 'Redux/Store';
import {NotificationManager} from 'react-notifications';

export const getAddress = (state) => state.account.address

function* submitProposalWorker({payload}) {
  try {
    // const {
    //   signature, 
    //   payload: hash
    // } = yield signTransaction();

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
      failureMessage: "Submit Proposal Failed",
      requireSigning: true,
      callBackAfterSigning: () => store.dispatch(setSubmittingProposal(true))
      // signature: signature,
      // payload: hash,
      // address: walletAddress
    });
    yield put(submitProposalSuccess(
      {
        response,
        proposal: payload.proposal
      }
    ));
  } catch (error) {
    if(error.message === "-1") {
      return;
    }
    NotificationManager.error(error.message, "Submit Proposal Failed");

    yield put(submitProposalFailure());
  }
}

export default submitProposalWorker;