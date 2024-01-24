import { put, call } from 'redux-saga/effects';
import {
  fetchProgressReportListSuccess,
  fetchProgressReportListFailure,
} from '../../Reducers/progressReportSlice';
import { callKeyStoreWallet } from '../../ICON/utils';
import { progressReportStatusMapping } from 'Constants';

function* submitProgressReportWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getProgressReports',
      params: {
        status: progressReportStatusMapping.find(
          mapping => mapping.name === payload.status,
        ).status,
        // _address: payload.walletAddress,
        // _end_index: `${payload.pageNumber * 10}`,
        startIndex: `${payload.pageNumber * 10 - 10}`,
      },
    });

    // const response = {
    //   data: Array(10).fill(0).map((_, index) => (  {
    //         _status:"_rejected",
    //         _project_report_title :`${payload.status} ${payload.pageNumber}${index} New Project Report`,
    //         _proposal_title: 'New Proposal',
    //         _contributor_address: 'hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931',
    //         _timestamp : 1600872145290985,
    //         _ipfs_hash: "bafybeidtxjlihr5rxkbtpa2smuwq7skj7gysuctaohx5lpwju26qt3k2ha",
    //         _report_key: 'report1234',
    //         _ipfs_key: 'ipfs1234',
    //          approved_votes:"0x410d586a20a4c00000",
    //          total_votes:"0xa2a15d09519be00000"
    //     }
    //     )),
    //     count: 143

    // }
    yield put(
      fetchProgressReportListSuccess({
        response,
        status: payload.status,
        pageNumber: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(fetchProgressReportListFailure(error));
  }
}

export default submitProgressReportWorker;
