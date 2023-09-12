import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchProposalByAddressSuccess,
  fetchProposalByAddressFailure,
} from '../../Reducers/proposalSlice';

const proposalListStatusMapping = {
  Active: '_active',
  Voting: '_pending',
  Pending: '_sponsor_pending',

  Completed: '_completed',
  Disqualified: '_rejected',
  Paused: '_paused',
  Rejected: '_rejected',
};

function* fetchProposalByAddressWorker({ payload }) {
  try {
    const responseActive = yield call(callKeyStoreWallet, {
      method: 'getActiveProposals',
      params: {
        // _status: '_active',
        walletAddress: payload.walletAddress,
      },
    });

    // const responseActive = [
    //     {
    //         project_title: "Video Content Marketing - Grow ICON Community",
    //         ipfs_hash: "undefined46c3b07a-2f67-4caa-bc88-6290da31901d",
    //         new_progress_report: '0x01',
    //          last_progress_report: '0x01'
    //     },

    //     {
    //       project_title: "ICON Mobile Wallet",
    //       ipfs_hash: "undefined46c3b07a-2f67-4caa-bc88-6290da31901e",
    //       new_progress_report: '0x01',
    //       last_progress_report: '0x00'

    //   },

    //   {
    //     project_title: "Video Content Marketing",
    //     ipfs_hash: "undefined46c3b07a-2f67-4caa-bc88-6290da31901i",
    //     new_progress_report: '0x01',
    //     last_progress_report: '0x01'

    // }

    // ]

    // const responsePaused = yield call(callKeyStoreWallet, {
    //     method: '_get_active_proposals',
    //     params: {
    //         _status: '_paused',
    //       _wallet_address: payload.walletAddress,

    //   }
    // });

    const responsePaused = [
      // {
      //     _proposal_title: "Paused Project 1",
      //     _ipfs_key: "proposal3da587f3-49a9-4ad0-8455-733071552845"
      // },
      // {
      //     _proposal_title: "Paused Project 2",
      //     _ipfs_key: "proposal3da587f3-49a9-4ad0-8455-733071552845"
      // }
    ];

    const combinedResponses = [...responseActive, ...responsePaused];
    yield put(
      fetchProposalByAddressSuccess({
        response: combinedResponses,
        // response,
        // status: payload.status,
        // pageNumber: payload.pageNumber
      }),
    );
  } catch (error) {
    yield put(fetchProposalByAddressFailure());
  }
}

export default fetchProposalByAddressWorker;
