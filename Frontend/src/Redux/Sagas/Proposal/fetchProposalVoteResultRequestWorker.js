import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchVoteResultSuccess,
  fetchVoteResultFailure,
} from '../../Reducers/proposalSlice';

// const proposalListStatusMapping = {
//   'Active': '_active',
//   'Voting': '_pending',
//   'Pending': '_sponsor_pending',

//   'Completed': '_completed',
//   'Disqualified': '_rejected',
//   'Paused': '_paused',
//   'Rejected': '_rejected'
// }

function* fetchProposalVoteResultRequestWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getVoteResult',
      params: {
        ipfsKey: payload.proposalKey,
      },
    });

    // const response = {
    //   data: Array(10).fill(0).map((_, index) => (  {
    //         status:"_pending",
    //         _proposal_title :`${payload.status} ${payload.pageNumber}${index} New Proposal`,
    //         address : (index % 2 === 0) ? "hx177b10efe3018961a405cc7c20ee811c552831a5": "hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931",
    //         budget : 10000,
    //         vote : (index % 2 === 0) ? "_rejected": "_approved",
    //         _ipfs_hash: "bafybeih63y3v5goi3if4e3yrwsjnc2lv7uiesui2cuamfvvgebki5ewo2e",
    //           _ipfs_key: "proposal338e7daa-867e-4ea1-995b-b0e118b0036e",
    //           _timestamp : 1600872145290985,

    //     }
    //     )),
    //     count: 143

    // }
    yield put(
      fetchVoteResultSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchVoteResultFailure());
  }
}

export default fetchProposalVoteResultRequestWorker;
