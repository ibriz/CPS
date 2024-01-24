import { put, call } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import {
  fetchSponsorRequestsListSuccess,
  fetchSponsorRequestsListFailure,
} from '../../Reducers/proposalSlice';
import { IconConverter } from 'icon-sdk-js';

const proposalListStatusMapping = {
  Pending: '_sponsor_pending',
  Approved: '_approved',
  Rejected: '_rejected',
  Disqualified: '_disqualified',
};

function* fetchSponsorRequestsListWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getSponsorsRequests',
      params: {
        status: proposalListStatusMapping[payload.status],
        sponsorAddress: payload.walletAddress,
        startIndex: 0,
      },
    });

    const totalCount = IconConverter.toNumber(response.count);
    let fetchedCount = response.data.length;
    while (fetchedCount < totalCount) {
      let temp = yield call(callKeyStoreWallet, {
        method: 'getSponsorsRequests',
        params: {
          status: proposalListStatusMapping[payload.status],
          sponsorAddress: payload.walletAddress,
          startIndex: `${Number(fetchedCount) || 0}`,
        },
      });
      fetchedCount += temp.data.length;
      response.data.push(...temp.data);
    }

    // const response = {
    //   data: Array(10).fill(0).map((_, index) => (  {
    //         _status:"_sponsor_pending",
    //         _proposal_title :`${payload.status} ${payload.pageNumber}${index} New Sponsor Request`,
    //         _contributor_address : (index % 2 === 0) ? "hx177b10efe3018961a405cc7c20ee811c552831a5": "hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931",
    //         budget : 10000,
    //         _timestamp : 1600872145290985,
    //         _ipfs_hash: "bafybeih63y3v5goi3if4e3yrwsjnc2lv7uiesui2cuamfvvgebki5ewo2e",
    //           _ipfs_key: "proposal338e7daa-867e-4ea1-995b-b0e118b0036e"
    //     }
    //     )),
    //     _total_items: 143

    // }
    yield put(
      fetchSponsorRequestsListSuccess({
        response,
        status: payload.status,
        pageNumber: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(fetchSponsorRequestsListFailure());
  }
}

export default fetchSponsorRequestsListWorker;
