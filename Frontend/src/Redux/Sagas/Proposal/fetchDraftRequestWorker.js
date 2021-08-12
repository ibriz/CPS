import { call, put, select } from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchDraftsSuccess,
  fetchDraftsFailure,
} from '../../Reducers/proposalSlice';
import { PROPOSAL_ADD_URL } from '../../Constants';
import { getRequest } from '../helpers';

function* fetchDraftRequestWorker({ payload }) {
  console.log('fetchDraftRequestWorker');
  try {
    const response = yield call(getRequest, {
      url: `draft?address=${payload.walletAddress}&type=Proposal`,
      method: 'GET',
    });
    const getAddress = state => state.account.address;
    const walletAddress = yield select(getAddress);

    // const response = [
    //   {
    //     proposalName: "CPS4",
    //     ipfsHash: "bafybeihrisdhrsdcqp3zhtahykdynfaymmif7sxma3yfrrtdyp6zg5zysi",
    //     ipfsUrl: "https://gateway.ipfs.io/ipfs/bafybeidl63hdrd447z2fymqikhqv5gzbjnbomxftpzit5asqhtxcqmmdiu",
    //     ipfsKey: "Proposalc27bb223-4c96-4783-a6e7-3916bc7dea2f"
    //   }
    // ]
    yield put(
      fetchDraftsSuccess({
        response,
        contributorAddress: walletAddress,
      }),
    );
  } catch (error) {
    yield put(fetchDraftsFailure());
  }
}

export default fetchDraftRequestWorker;
