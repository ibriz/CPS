import { put, call } from 'redux-saga/effects';
import {
  fetchProgressReportByProposalSuccess,
  fetchProgressReportByProposalFailure,
} from '../../Reducers/progressReportSlice';
import { callKeyStoreWallet } from '../../ICON/utils';
import { progressReportStatusMapping } from 'Constants';

function* submitProgressReportWorker({ payload }) {
  try {
    const response = yield call(callKeyStoreWallet, {
      method: 'getProgressReportsByProposal',
      params: {
        ipfsKey: payload.proposalKey,
      },
    });

    // const response = {
    //   data: Array(10).fill(0).map((_, index) => (  {
    //         _status:"_waiting",
    //         _project_report_title :`${payload.status} ${payload.pageNumber}${index} New Project Report`,
    //         _proposal_title: 'New Proposal',
    //         _contributor_address: 'hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931',
    //         _timestamp : 1600872145290985,
    //         _ipfs_hash: "bafybeidtxjlihr5rxkbtpa2smuwq7skj7gysuctaohx5lpwju26qt3k2ha",
    //         _report_key: 'report1234',
    //         _ipfs_key: 'ipfs1234'
    //     }
    //     )),
    //     count: 143

    // }
    yield put(
      fetchProgressReportByProposalSuccess({
        response,
      }),
    );
  } catch (error) {
    yield put(fetchProgressReportByProposalFailure(error));
  }
}

export default submitProgressReportWorker;
