import { login, logout, loginPrepRequest } from '../Reducers/accountSlice';
import { takeEvery } from 'redux-saga/effects'

import {
  loginWorker,
  logoutWorker,
  loginPrepWorker
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
  fetchProposalVoteResultRequestWorker,
  fetchProjectAmountsWorker
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

import {
  fetchCPFScoreAddressWorker,
  fetchCPFRemainingFundWorker
} from './Fund';

import { fetchPrepWorker, unregisterPrepWorker, registerPrepWorker, payPenaltyWorker } from './PRep';
import {fetchPeriodDetailsRequestWorker, updatePeriodWorker} from './Period'

import { submitProposalRequest, submitProposalSuccess, fetchProposalListRequest, updateProposalStatus,  fetchProposalDetailRequest, fetchSponsorRequestsListRequest,
  approveSponserRequest,
  rejectSponsorRequest,
  saveDraftRequest, fetchDraftsRequest,
  voteProposal, fetchProposalByAddressRequest,
  fetchVoteResultRequest as fetchProposalVoteResultRequest,
  fetchProjectAmountsRequest} from '../Reducers/proposalSlice';
import { submitProgressReportRequest, submitProgressReportSuccess, fetchProgressReportListRequest, fetchProgressReportDetailRequest,
  fetchDraftsRequest as fetchDraftsRequestProgressReport,
  saveDraftRequest as saveDraftRequestProgressReport,
  voteProgressReport,
  fetchVoteResultRequest as fetchProgressReportVoteResultRequest,
  fetchProgressReportByProposalRequest
} from '../Reducers/progressReportSlice';
import {fetchPeriodDetailsRequest, updatePeriod} from '../Reducers/periodSlice';
import { fetchPrepsRequest, unregisterPrep, registerPrep, payPenalty } from '../Reducers/prepsSlice';
import {fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest} from '../Reducers/fundSlice';
import { FiPrinter } from 'react-icons/fi';

function* rootSaga() {

  yield takeEvery(login.type, loginWorker);
  yield takeEvery(logout.type, logoutWorker);
  yield takeEvery(loginPrepRequest.type, loginPrepWorker)

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

yield takeEvery(unregisterPrep.type, unregisterPrepWorker);

yield takeEvery(registerPrep.type, registerPrepWorker);

yield takeEvery(fetchCPFScoreAddressRequest.type, fetchCPFScoreAddressWorker);
yield takeEvery(fetchCPFRemainingFundRequest.type, fetchCPFRemainingFundWorker);

yield takeEvery(fetchProjectAmountsRequest.type, fetchProjectAmountsWorker);

yield takeEvery(payPenalty.type, payPenaltyWorker)





}

export default rootSaga;