import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchMyProposalListSuccess,
  fetchMyProposalListFailure,
} from '../../Reducers/proposalSlice';
import { IconConverter } from 'icon-sdk-js';

const proposalListStatusMapping = {
  Active: '_active',
  Voting: '_pending',
  Pending: '_sponsor_pending',

  Completed: '_completed',
  Disqualified: '_rejected',
  Paused: '_paused',
  Rejected: '_rejected',
};

function* fetchMyProposalListWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getProposalDetailByWallet',
      params: {
        walletAddress: payload.walletAddress,
        startIndex: 0,
      },
    });

    const totalCount = IconConverter.toNumber(response.count);
    let fetchedCount = response.data.length;
    while (fetchedCount < totalCount) {
      let temp = yield call(callKeyStoreWallet, {
        method: 'getProposalDetailByWallet',
        params: {
          walletAddress: payload.walletAddress,
          startIndex: `${Number(fetchedCount) || 0}`,
        },
      });
      fetchedCount += temp.data.length;
      response.data.push(...temp.data);
    }

    // const response = {
    //   data: Array(10).fill(0).map((_, index) => (  {
    //         _status:"_sponsor_pending",
    //         _proposal_title :`${payload.status} ${payload.pageNumber}${index} New Proposal`,
    //         _contributor_address : (index % 2 === 0) ? "hx177b10efe3018961a405cc7c20ee811c552831a5": "hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931",
    //         budget : 10000,
    //         _timestamp : 1600872145290985,
    //         _ipfs_hash: "bafybeih63y3v5goi3if4e3yrwsjnc2lv7uiesui2cuamfvvgebki5ewo2e",
    //           _ipfs_key: "proposal338e7daa-867e-4ea1-995b-b0e118b0036e",
    //           approved_votes:"0x410d586a20a4c00000",
    //           total_votes:"0xa2a15d09519be00000",
    //           completed_percentage: "0x20"
    //     }
    //     )),
    //     count: 143

    // }

    // const response = {
    //   data: [

    //     {
    //       status: "_active",
    //       project_title: "ICON Mobile Wallet",
    //       total_budget: "12000 ICX" ,
    //     timestamp: "1600872144290885",
    //     contributor_address: payload.walletAddress,
    //     ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901e'

    //     },

    //     {
    //       status: "_sponsor_pending",
    //       project_title: "New Proposal 1",
    //       total_budget: "12000 ICX" ,
    //     timestamp: "1600872144290885",
    //     contributor_address: payload.walletAddress,
    //     ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901f'

    //     },
    //     {
    //       status: "_pending",
    //       project_title: "New Proposal 2",
    //       total_budget: "12000 ICX" ,
    //     timestamp: "1600872144290885",
    //     contributor_address: payload.walletAddress,
    //     ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901g'

    //     },

    //     {
    //       status: "_active",
    //       project_title: "Video Content Marketing",
    //       total_budget: "10000 ICX" ,
    //     timestamp: "1600872145290985",
    //     contributor_address: payload.walletAddress,
    //     ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901i'
    //     },

    //     {
    //       status: "_rejected",
    //       project_title: "New Proposal",
    //       total_budget: "12000 ICX" ,
    //     timestamp: "1600872144290885",
    //     contributor_address: payload.walletAddress,
    //     ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901h'

    //     },

    //     {
    //       status: "_active",
    //       project_title: "Video Content Marketing - Grow ICON Community",
    //       total_budget: "10000 ICX" ,
    //     timestamp: "1600872145290985",
    //     contributor_address: payload.walletAddress,
    //     ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901d'
    //     },
    //   ],
    //   count: 2
    // }
    yield put(
      fetchMyProposalListSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchMyProposalListFailure());
  }
}

export default fetchMyProposalListWorker;
