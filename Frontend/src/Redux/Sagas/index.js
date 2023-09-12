import {
  login,
  logout,
  loginPrepRequest,
  signTransaction,
} from '../Reducers/accountSlice';
import { takeEvery } from 'redux-saga/effects';

import {
  loginWorker,
  logoutWorker,
  loginPrepWorker,
  signTransactionWorker,
} from './Account';

import {
  submitProposalToIPFSWorker,
  submitProposalToScoreWorker,
  fetchProposalListWorker,
  fetchSortPriorityProposalListWorker,
  fetchMyProposalListWorker,
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
  fetchProjectAmountsWorker,
  fetchRemainingVotesRequestWorker,
  fetchSponsorMessageRequestWorker,
  fetchProposalByIpfsWorker,
  emptyProposalDetailWorker,
  fetchChangeVoteWorker,
  submitPriorityVotingWorker,
  fetchPriorityVotingStatusWorker,
} from './Proposal/index';

import {
  submitProgressReportToIPFSWorker,
  submitProgressReportToScoreWorker,
  fetchProgressReportListWorker,
  fetchProgressReportDetailWorker,
  saveDraftRequestProgressReportWorker,
  fetchDraftRequestProgressReportWorker,
  voteProgressReportWorker,
  fetchProgressReportVoteResultRequestWorker,
  fetchProgressReportByProposalRequestWorker,
  fetchVoteResultBudgetChangeRequestWorker,
  fetchProgressReportByIpfsWorker,
  emptyProgressReportDetailWorker,
  fetchChangeVoteWorkerProgressReport,
} from './ProgressReport';

import {
  fetchCPFTreasuryScoreAddressWorker,
  fetchCPFRemainingFundWorker,
  fetchMaintenanceModeWorker,
  fetchExpectedGrantRequestWorker,
  fetchCPSTreasuryScoreAddressWorker,
  claimRewardWorker,
  fetchSponsorBondWorker,
  claimSponsorBondWorker,
  fetchbnUSDAddressWorker,
  fetchAvailableFundWorker,
  fetchSponsorDepositAmountWorker,
  fetchRemainingSwapAmountWorker,
} from './Fund';

import {
  fetchPrepWorker,
  unregisterPrepWorker,
  registerPrepWorker,
  fetchSponsorBondPercentageWorker,
  payPenaltyWorker,
  fetchPrepsWithStatsWorker,
} from './PRep';
import {
  fetchPeriodDetailsRequestWorker,
  fetchPeriodCountWorker,
  updatePeriodWorker,
  updatePeriodFrontendWalletWorker,
} from './Period';

import {
  fetchUserDataRequestWorker,
  submitUserDataRequestWorker,
  resendVerificationEmailRequestWorker,
  fetchUserPromptRequestWorker,
  disableUserPromptRequestWorker,
} from './User';

import {
  submitProposalRequest,
  submitProposalSuccess,
  fetchProposalListRequest,
  fetchMyProposalListRequest,
  updateProposalStatus,
  fetchProposalDetailRequest,
  fetchSponsorRequestsListRequest,
  approveSponserRequest,
  rejectSponsorRequest,
  saveDraftRequest,
  fetchDraftsRequest,
  voteProposal,
  fetchProposalByAddressRequest,
  fetchVoteResultRequest as fetchProposalVoteResultRequest,
  fetchProjectAmountsRequest,
  fetchRemainingVotesRequest,
  fetchSponsorMessageRequest,
  fetchProposalByIpfsRequest,
  emptyProposalDetailRequest,
  fetchChangeVoteRequest,
  submitPriorityVotingRequest,
  fetchPriorityVotingRequest,
  fetchSortPriorityProposalListRequest,
  fetchProposalHistoryRequest,
} from '../Reducers/proposalSlice';
import {
  submitProgressReportRequest,
  submitProgressReportSuccess,
  fetchProgressReportListRequest,
  fetchProgressReportDetailRequest,
  fetchDraftsRequest as fetchDraftsRequestProgressReport,
  saveDraftRequest as saveDraftRequestProgressReport,
  voteProgressReport,
  fetchVoteResultRequest as fetchProgressReportVoteResultRequest,
  fetchProgressReportByProposalRequest,
  fetchVoteResultBudgetChangeRequest,
  fetchProgressReportByIpfsRequest,
  emptyProgressReportDetailRequest,
  fetchChangeVoteRequestProgressReport,
} from '../Reducers/progressReportSlice';
import {
  fetchPeriodDetailsRequest,
  fetchPeriodCountRequest,
  updatePeriod,
  updatePeriodFrontendWallet,
} from '../Reducers/periodSlice';
import {
  fetchPrepsRequest,
  fetchPrepsWithStatsRequest,
  unregisterPrep,
  registerPrep,
  payPenalty,
  fetchSponsorBondPercentageRequest
} from '../Reducers/prepsSlice';
import {
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  fetchExpectedGrantRequest,
  fetchCPSTreasuryScoreAddressRequest,
  claimReward,
  fetchSponsorBondRequest,
  claimSponsorBondReward,
  fetchbnUSDAddressRequest,
  fetchAvailableFundRequest,
  fetchSponsorDepositAmountRequest,
  fetchMaintenanceModeRequest,
  fetchRemainingSwapAmountRequest,
} from '../Reducers/fundSlice';
import {
  fetchUserDataRequest,
  submitUserDataRequest,
  resendVerificationEmailRequest,
  fetchUserPromptRequest,
  disableUserPromptRequest,
} from '../Reducers/userSlice';
import { FiPrinter } from 'react-icons/fi';
import fetchProposalHistoryWorker from './Proposal/fetchProposalHistoryWorker';

function* rootSaga() {
  yield takeEvery(login.type, loginWorker);
  yield takeEvery(signTransaction.type, signTransactionWorker);
  yield takeEvery(logout.type, logoutWorker);
  yield takeEvery(loginPrepRequest.type, loginPrepWorker);

  yield takeEvery(submitProposalRequest.type, submitProposalToIPFSWorker);
  yield takeEvery(submitProposalSuccess.type, submitProposalToScoreWorker);

  yield takeEvery(fetchProposalListRequest.type, fetchProposalListWorker);
  yield takeEvery(fetchProposalHistoryRequest.type, fetchProposalHistoryWorker);

  yield takeEvery(
    fetchSortPriorityProposalListRequest.type,
    fetchSortPriorityProposalListWorker,
  );
  yield takeEvery(fetchSponsorBondPercentageRequest.type, fetchSponsorBondPercentageWorker);
  yield takeEvery(fetchMyProposalListRequest.type, fetchMyProposalListWorker);
  yield takeEvery(fetchProposalByIpfsRequest.type, fetchProposalByIpfsWorker);

  yield takeEvery(
    submitProgressReportRequest.type,
    submitProgressReportToIPFSWorker,
  );
  yield takeEvery(
    submitProgressReportSuccess.type,
    submitProgressReportToScoreWorker,
  );

  yield takeEvery(
    fetchProgressReportListRequest.type,
    fetchProgressReportListWorker,
  );
  yield takeEvery(
    fetchProgressReportByIpfsRequest.type,
    fetchProgressReportByIpfsWorker,
  );

  yield takeEvery(updateProposalStatus.type, updateProposalStatusWorker);

  yield takeEvery(fetchPrepsRequest.type, fetchPrepWorker);
  yield takeEvery(fetchPrepsWithStatsRequest.type, fetchPrepsWithStatsWorker);

  yield takeEvery(fetchProposalDetailRequest.type, fetchProposalDetailWorker);
  yield takeEvery(
    fetchProgressReportDetailRequest.type,
    fetchProgressReportDetailWorker,
  );

  yield takeEvery(
    fetchSponsorRequestsListRequest.type,
    fetchSponsorRequestsListWorker,
  );

  yield takeEvery(approveSponserRequest.type, approveSponserRequestWorker);
  yield takeEvery(rejectSponsorRequest.type, rejectSponserRequestWorker);

  yield takeEvery(saveDraftRequest.type, saveDraftRequestWorker);
  yield takeEvery(
    saveDraftRequestProgressReport.type,
    saveDraftRequestProgressReportWorker,
  );

  yield takeEvery(fetchDraftsRequest.type, fetchDraftRequestWorker);

  yield takeEvery(
    fetchDraftsRequestProgressReport.type,
    fetchDraftRequestProgressReportWorker,
  );

  yield takeEvery(voteProposal.type, voteProposalWorker);

  yield takeEvery(
    fetchProposalByAddressRequest.type,
    fetchProposalByAddressWorker,
  );

  yield takeEvery(voteProgressReport.type, voteProgressReportWorker);

  yield takeEvery(
    fetchProposalVoteResultRequest.type,
    fetchProposalVoteResultRequestWorker,
  );
  yield takeEvery(
    fetchProgressReportVoteResultRequest.type,
    fetchProgressReportVoteResultRequestWorker,
  );

  yield takeEvery(
    fetchProgressReportByProposalRequest.type,
    fetchProgressReportByProposalRequestWorker,
  );
  yield takeEvery(
    fetchPeriodDetailsRequest.type,
    fetchPeriodDetailsRequestWorker,
  );
  yield takeEvery(fetchPeriodCountRequest.type, fetchPeriodCountWorker);

  yield takeEvery(updatePeriod.type, updatePeriodWorker);
  yield takeEvery(
    updatePeriodFrontendWallet.type,
    updatePeriodFrontendWalletWorker,
  );

  yield takeEvery(unregisterPrep.type, unregisterPrepWorker);

  yield takeEvery(registerPrep.type, registerPrepWorker);

  yield takeEvery(
    fetchCPFTreasuryScoreAddressRequest.type,
    fetchCPFTreasuryScoreAddressWorker,
  );
  yield takeEvery(fetchbnUSDAddressRequest.type, fetchbnUSDAddressWorker);
  yield takeEvery(
    fetchCPSTreasuryScoreAddressRequest.type,
    fetchCPSTreasuryScoreAddressWorker,
  );

  yield takeEvery(
    fetchCPFTreasuryScoreAddressRequest.type,
    fetchCPFTreasuryScoreAddressWorker,
  );

  yield takeEvery(
    fetchCPFRemainingFundRequest.type,
    fetchCPFRemainingFundWorker,
  );

  yield takeEvery(fetchMaintenanceModeRequest.type, fetchMaintenanceModeWorker);

  yield takeEvery(
    fetchRemainingSwapAmountRequest.type,
    fetchRemainingSwapAmountWorker,
  );

  yield takeEvery(fetchProjectAmountsRequest.type, fetchProjectAmountsWorker);

  yield takeEvery(payPenalty.type, payPenaltyWorker);

  yield takeEvery(fetchUserDataRequest.type, fetchUserDataRequestWorker);
  yield takeEvery(submitUserDataRequest.type, submitUserDataRequestWorker);

  yield takeEvery(
    fetchExpectedGrantRequest.type,
    fetchExpectedGrantRequestWorker,
  );

  yield takeEvery(
    fetchRemainingVotesRequest.type,
    fetchRemainingVotesRequestWorker,
  );

  yield takeEvery(
    fetchVoteResultBudgetChangeRequest.type,
    fetchVoteResultBudgetChangeRequestWorker,
  );

  yield takeEvery(claimReward.type, claimRewardWorker);
  yield takeEvery(claimSponsorBondReward.type, claimSponsorBondWorker);

  yield takeEvery(fetchSponsorBondRequest.type, fetchSponsorBondWorker);

  yield takeEvery(
    resendVerificationEmailRequest.type,
    resendVerificationEmailRequestWorker,
  );

  yield takeEvery(
    fetchSponsorMessageRequest.type,
    fetchSponsorMessageRequestWorker,
  );

  yield takeEvery(fetchUserPromptRequest.type, fetchUserPromptRequestWorker);
  yield takeEvery(
    disableUserPromptRequest.type,
    disableUserPromptRequestWorker,
  );
  yield takeEvery(emptyProposalDetailRequest.type, emptyProposalDetailWorker);
  yield takeEvery(
    emptyProgressReportDetailRequest.type,
    emptyProgressReportDetailWorker,
  );
  yield takeEvery(fetchChangeVoteRequest.type, fetchChangeVoteWorker);
  yield takeEvery(
    fetchChangeVoteRequestProgressReport.type,
    fetchChangeVoteWorkerProgressReport,
  );

  yield takeEvery(fetchAvailableFundRequest.type, fetchAvailableFundWorker);

  yield takeEvery(
    fetchSponsorDepositAmountRequest.type,
    fetchSponsorDepositAmountWorker,
  );

  yield takeEvery(submitPriorityVotingRequest.type, submitPriorityVotingWorker);

  yield takeEvery(
    fetchPriorityVotingRequest.type,
    fetchPriorityVotingStatusWorker,
  );
}

export default rootSaga;
