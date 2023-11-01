import { call, put, select } from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  submitMigrationProposalSuccess,
  submitMigrationProposalFailure,
  setSubmittingProposal,
} from '../../Reducers/proposalSlice';
import { PROPOSAL_ADD_URL } from '../../Constants';
import { request } from '../helpers';
import { signTransaction } from 'Redux/ICON/utils';
import store from 'Redux/Store';
import { NotificationManager } from 'react-notifications';

export const getAddress = state => state.account.address;

function* submitMigrationProposalWorker({ payload }) {
  try {
    // const {
    //   signature,
    //   payload: hash
    // } = yield signTransaction();
    const {oldIpfsKey, ipfsKey, ...rest} = payload.proposal;
    console.log("excpet old ipfs hash",rest)
    const getAddress = state => state.account.address;
    const walletAddress = yield select(getAddress);

    const address = yield select(getAddress);

    yield signTransaction(address);
    console.log("payload in ipfs worker",payload);
    const response = yield call(request, {
      body: rest,
      url: PROPOSAL_ADD_URL,
      failureMessage: 'Submit Proposal Failed',
      signature: store.getState().account.signature,
      payload: store.getState().account.signatureRawData,
      callBackAfterSigning: () => store.dispatch(setSubmittingProposal(true)),
      // signature: signature,
      // payload: hash,
      // address: walletAddress
    });
    yield put(
      submitMigrationProposalSuccess({
        response,
        proposal: payload.proposal,
      }),
    );
  } catch (error) {
    if (error.message === '-1') {
      return;
    }
    NotificationManager.error(error.message, 'Submit Proposal Failed');

    yield put(submitMigrationProposalFailure());
  }
}

export default submitMigrationProposalWorker;
