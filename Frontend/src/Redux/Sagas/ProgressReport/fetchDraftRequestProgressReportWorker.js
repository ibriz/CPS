import { call, put, select} from 'redux-saga/effects';
// import {
//   getCourseInfo,
// } from '../services/api';
import {fetchDraftsSuccess, fetchDraftsFailure} from '../../Reducers/progressReportSlice';
import {PROPOSAL_ADD_URL} from '../../Constants';
import {getRequest} from '../helpers';

function* fetchDraftRequestWorker({payload}) {
  console.log("fetchDraftRequestWorker");



  try {

    const getAddress = (state) => state.account.address
    const walletAddress = yield select(getAddress);

    const response = [
      {
        ipfsHash: 'dsfsdfsdf',
        proposalName: 'Hello World',
        progressReportName: 'ProgressReport1',
        contributorAddress: walletAddress,
        hash: 'wrwerwer1232132'
      }
    ]

    // const response = yield call(getRequest, {
    //   url: `redis/user/reports?address=${payload.walletAddress}`,
    //   method: 'GET'
    // });
    yield put(fetchDraftsSuccess(
      {
        response,
      }
    ));
  } catch (error) {
    yield put(fetchDraftsFailure());
  }
}


export default fetchDraftRequestWorker;