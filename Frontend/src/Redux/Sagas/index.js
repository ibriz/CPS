import { login, logout } from '../Reducers/accountSlice';
import { takeEvery } from 'redux-saga/effects'

import {
  loginWorker,
  logoutWorker
} from './Account';

import {
  submitProposalToIPFSWorker,
  submitProposalToScoreWorker,
  fetchProposalListWorker,
  updateProposalStatusWorker,
  fetchProposalDetailWorker,
  fetchSponsorRequestsListWorker,
  approveSponserRequestWorker,
  rejectSponserRequestWorker,
  saveDraftRequestWorker,
  fetchDraftRequestWorker,
  voteProposalWorker,
  fetchProposalByAddressWorker,
  fetchProposalVoteResultRequestWorker
} from './Proposal';

import {
  submitProgressReportToIPFSWorker,
  submitProgressReportToScoreWorker,
  fetchProgressReportListWorker,
  fetchProgressReportDetailWorker,
  saveDraftRequestProgressReportWorker,
  fetchDraftRequestProgressReportWorker,
  voteProgressReportWorker,
  fetchProgressReportVoteResultRequestWorker,
  fetchProgressReportByProposalRequestWorker
} from './ProgressReport';

import { fetchPrepWorker } from './PRep';
import {fetchPeriodDetailsRequestWorker, updatePeriodWorker} from './Period'

import { submitProposalRequest, submitProposalSuccess, fetchProposalListRequest, updateProposalStatus,  fetchProposalDetailRequest, fetchSponsorRequestsListRequest,
  approveSponserRequest,
  rejectSponsorRequest,
  saveDraftRequest, fetchDraftsRequest,
  voteProposal, fetchProposalByAddressRequest,
  fetchVoteResultRequest as fetchProposalVoteResultRequest} from '../Reducers/proposalSlice';
import { submitProgressReportRequest, submitProgressReportSuccess, fetchProgressReportListRequest, fetchProgressReportDetailRequest,
  fetchDraftsRequest as fetchDraftsRequestProgressReport,
  saveDraftRequest as saveDraftRequestProgressReport,
  voteProgressReport,
  fetchVoteResultRequest as fetchProgressReportVoteResultRequest,
  fetchProgressReportByProposalRequest
} from '../Reducers/progressReportSlice';
import {fetchPeriodDetailsRequest, updatePeriod} from '../Reducers/periodSlice';
import { fetchPrepsRequest } from '../Reducers/prepsSlice';
import { FiPrinter } from 'react-icons/fi';



function* rootSaga() {

  yield takeEvery(login.type, loginWorker);
  yield takeEvery(logout.type, logoutWorker);

  yield takeEvery(submitProposalRequest.type, submitProposalToIPFSWorker);
  yield takeEvery(submitProposalSuccess.type, submitProposalToScoreWorker);

  yield takeEvery(fetchProposalListRequest.type, fetchProposalListWorker);

  yield takeEvery(submitProgressReportRequest.type, submitProgressReportToIPFSWorker);
  yield takeEvery(submitProgressReportSuccess.type, submitProgressReportToScoreWorker);

  yield takeEvery(fetchProgressReportListRequest.type, fetchProgressReportListWorker);

  yield takeEvery(updateProposalStatus.type, updateProposalStatusWorker);

  yield takeEvery(fetchPrepsRequest.type, fetchPrepWorker);

  yield takeEvery(fetchProposalDetailRequest.type, fetchProposalDetailWorker);
  yield takeEvery(fetchProgressReportDetailRequest.type, fetchProgressReportDetailWorker);

  yield takeEvery(fetchSponsorRequestsListRequest.type, fetchSponsorRequestsListWorker);

  yield takeEvery(approveSponserRequest.type, approveSponserRequestWorker);
  yield takeEvery(rejectSponsorRequest.type, rejectSponserRequestWorker);

  yield takeEvery(saveDraftRequest.type, saveDraftRequestWorker);
  yield takeEvery(saveDraftRequestProgressReport.type, saveDraftRequestProgressReportWorker);


  yield takeEvery(fetchDraftsRequest.type, fetchDraftRequestWorker);

  yield takeEvery(fetchDraftsRequestProgressReport.type, fetchDraftRequestProgressReportWorker);

  yield takeEvery(voteProposal.type, voteProposalWorker);

  yield takeEvery(fetchProposalByAddressRequest.type, fetchProposalByAddressWorker)

  yield takeEvery(voteProgressReport.type, voteProgressReportWorker)

  yield takeEvery(fetchProposalVoteResultRequest.type, fetchProposalVoteResultRequestWorker)
  yield takeEvery(fetchProgressReportVoteResultRequest.type, fetchProgressReportVoteResultRequestWorker)


yield takeEvery(fetchProgressReportByProposalRequest.type, fetchProgressReportByProposalRequestWorker);
yield takeEvery(fetchPeriodDetailsRequest.type, fetchPeriodDetailsRequestWorker);

yield takeEvery(updatePeriod.type, updatePeriodWorker);




}

export default rootSaga;