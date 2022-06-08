import { createSlice } from '@reduxjs/toolkit';

import { IconConverter } from 'icon-sdk-js';
import { progressReportStatusMapping as progressReportMapping } from 'Constants';
import { calculatePercentage } from 'Helpers';

const PARAMS = {
  status: 'status',
  progressReportTitle: 'progress_report_title',
  proposalTitle: 'project_title',
  contributorAddress: 'contributor_address',
  totalBudget: 'total_budget',
  timestamp: 'timestamp',
  sponsoredTimestamp: 'sponsored_timestamp',
  proposalHash: 'ipfs_hash',
  reportHash: 'report_hash',

  approvedVotes: 'approved_votes',
  totalVotes: 'total_votes',
  rejectedVotes: 'rejected_votes',

  approvedVoters: 'approve_voters',
  totalVoters: 'total_voters',
  rejectedVoters: 'reject_voters',

  percentageCompleted: 'percentage_completed',

  newProgressReport: 'new_progress_report',
};

const progressReportList = [
  {
    _title: 'Approved 0 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_approved',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Approved 1 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_approved',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Approved 2 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_approved',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Rejected 3 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_rejected',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Rejected 4 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_rejected',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Approved 5 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_approved',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Voting 1 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_voting',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Voting 1 Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_voting',
    _ifps_hash: 'abcd',
  },

  {
    _title: 'Voting 2 Progress Report',
    _project_title: 'Contribute from Ecosystem Fund to Gitcoin Grants Round 7',
    _timestamp: 1600872145290985,
    _status: '_voting',
    _ifps_hash: 'abcd',
  },
];

const progressReportStatusMapping = {
  _rejected: 'Rejected',
  _approved: 'Approved',
  _waiting: 'Voting',
};

const initialState = {
  numberOfSubmittedProgressReports: 29,

  numberOfApprovedProgressReports: 29,

  // numberOfPendingProposals: 235,
  // totalPendingProposalBudge: 42900,
  // cpfRemainingFunds: 549300,
  submittingProgressReport: false,
  modalShowVotingPR: false,

  progressReportList: {
    Approved: [],
    Rejected: [],
    Voting: [],
    Draft: [],
  },

  progressReportDetail: null,

  totalPages: {
    Approved: 0,
    Rejected: 0,
    Voting: 0,
  },
  error: null,
  votesByProgressReport: [],

  votesBudgetChangeByProgressReport: [],

  progressReportByProposal: [],
  remainingVotes: [],
  selectedProgressReport: {},
  ipfsError: '',
  changeVote: false,
};

const proposalSlice = createSlice({
  name: 'progressReport',
  initialState,
  reducers: {
    submitProgressReportRequest(state) {
      // state.submittingProgressReport = true
    },
    submitProgressReportSuccess(state) {
      state.submittingProgressReport = false;
    },
    submitProgressReportFailure(state) {
      state.submittingProgressReport = false;
    },

    setSubmittingProgressReport(state) {
      state.submittingProgressReport = true;
    },

    fetchProgressReportListRequest(state) {
      return;
    },
    fetchProgressReportListSuccess(state, action) {
      // state.progressReportList = action.payload
      // state.progressReportList = progressReportList.map(progressReport);

      state.progressReportList[action.payload.status][
        action.payload.pageNumber - 1
      ] = action.payload.response.data
        .map(progressReport => ({
          status: progressReport[PARAMS.status],
          progressReportTitle: progressReport[PARAMS.progressReportTitle],
          projectTitle: progressReport[PARAMS.proposalTitle],
          contributorAddress: progressReport[PARAMS.contributorAddress],
          timestamp: progressReport[PARAMS.timestamp],
          ipfsHash: progressReport[PARAMS.reportHash],
          reportKey: progressReport[PARAMS.reportHash],
          proposalKey: progressReport[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            progressReport[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(
            progressReport[PARAMS.totalVotes],
          ),
          approvedPercentage: calculatePercentage({
            total: progressReport[PARAMS.totalVotes],
            actual: progressReport[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: progressReport[PARAMS.totalVoters],
            actual: progressReport[PARAMS.approvedVoters],
          }),

          rejectedPercentage: calculatePercentage({
            total: progressReport[PARAMS.totalVotes],
            actual: progressReport[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: progressReport[PARAMS.totalVoters],
            actual: progressReport[PARAMS.rejectedVoters],
          }),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      state.totalPages[action.payload.status] = Math.ceil(
        IconConverter.toNumber(action.payload.response.count) / 10,
      );
    },
    fetchProgressReportListFailure(state, action) {
      state.error = action.payload;
    },

    fetchProgressReportDetailRequest() {
      return;
    },

    fetchProgressReportDetailSuccess(state, action) {
      state.progressReportDetail = action.payload.response;
    },

    fetchProgressReportDetailFailure(state) {
      state.ipfsError = true;
    },
    emptyProgressReportDetailRequest() {
      return;
    },
    emptyProgressReportDetailSuccess(state) {
      delete state.progressReportDetail;
      state.ifpsError = '';
      state.selectedProgressReport = {};
    },
    emptyProposalReportDetailFailure() {
      return;
    },

    saveDraftRequest(state) {
      return;
    },
    saveDraftSuccess(state) {
      return;
    },
    saveDraftFailure(state) {
      return;
    },

    fetchDraftsRequest(state) {
      return;
    },
    fetchDraftsSuccess(state, payload) {
      state.progressReportList['Draft'] = payload.payload.response.map(
        (progressReport, index) => ({
          status: 'draft',
          progressReportTitle:
            progressReport.progressReportName || 'Untitled Progress Report',
          projectTitle: progressReport.proposalName || 'Untitled Proposal',
          contributorAddress: payload.payload.contributorAddress,
          index: index,
          // ipfsHash: progressReport[PARAMS.reportHash],
          reportHash: progressReport.ipfsHash,
          ipfsUrl: progressReport.ipfsUrl,
          ipfsKey: progressReport.ipfsKey,

          // timestamp: progressReport[PARAMS.timestamp],
          // proposalKey: progressReport[PARAMS.proposalHash],
          // approvedVotes: IconConverter.toBigNumber(progressReport[PARAMS.approvedVotes]),
          // totalVotes: IconConverter.toBigNumber(progressReport[PARAMS.totalVotes]),
          // approvedPercentage: (!progressReport[PARAMS.totalVotes] || parseInt(progressReport[PARAMS.totalVotes]) === 0) ? 0 : ((progressReport[PARAMS.approvedVotes] / progressReport[PARAMS.totalVotes]) * 100)
        }),
      );
    },
    fetchDraftsFailure(state) {
      return;
    },
    setModalShowVotingPR(state, action) {
      state.modalShowVotingPR = action.payload;
    },

    voteProgressReport(state) {
      return;
    },

    fetchVoteResultRequest() {
      return;
    },

    fetchVoteResultSuccess(state, action) {
      state.votesByProgressReport = action.payload.response.data.map(vote => ({
        sponsorAddress: vote.address,
        status: progressReportMapping.find(
          mapping => mapping.status === vote.vote,
        )?.name,
        timestamp: vote._timestamp,
        prepName: vote.prep_name,
        reason: vote.vote_reason,
      }));
      state.votesByProgressReport = state.votesByProgressReport.filter(
        vote => vote.status,
      );
      state.approvedVotes = IconConverter.toBigNumber(
        action.payload.response.approved_votes,
      );
      state.totalVotes = IconConverter.toBigNumber(
        action.payload.response.total_votes,
      );
      state.rejectedVotes = IconConverter.toBigNumber(
        action.payload.response.rejected_votes,
      );

      state.approvedVoters = IconConverter.toBigNumber(
        action.payload.response.approve_voters,
      );
      state.rejectedVoters = IconConverter.toBigNumber(
        action.payload.response.reject_voters,
      );
      state.totalVoters = IconConverter.toBigNumber(
        action.payload.response.total_voters,
      );

      return;
    },
    fetchVoteResultFailure() {
      return;
    },

    fetchVoteResultBudgetChangeRequest() {
      return;
    },

    fetchVoteResultBudgetChangeSuccess(state, action) {
      console.log('budgetChangeRequest', action.payload.response.data);
      state.votesBudgetChangeByProgressReport =
        action.payload.response.data.map(vote => ({
          sponsorAddress: vote.address,
          status: progressReportMapping.find(
            mapping => mapping.status === vote.vote,
          )?.name,
          timestamp: vote._timestamp,
          prepName: vote.prep_name,
        }));
      state.votesBudgetChangeByProgressReport =
        state.votesBudgetChangeByProgressReport.filter(vote => vote.status);
      state.approvedVotesBudgetChange = IconConverter.toBigNumber(
        action.payload.response.approved_votes,
      );
      state.totalVotesBudgetChange = IconConverter.toBigNumber(
        action.payload.response.total_votes,
      );
      state.rejectedVotesBudgetChange = IconConverter.toBigNumber(
        action.payload.response.rejected_votes,
      );

      state.approvedVotersBudgetChange = IconConverter.toBigNumber(
        action.payload.response.approve_voters,
      );
      state.rejectedVotersBudgetChange = IconConverter.toBigNumber(
        action.payload.response.reject_voters,
      );
      state.totalVotersBudgetChange = IconConverter.toBigNumber(
        action.payload.response.total_voters,
      );

      return;
    },
    fetchVoteResultBudgetChangeFailure() {
      return;
    },

    fetchProgressReportByProposalRequest() {
      return;
    },
    fetchProgressReportByProposalSuccess(state, action) {
      state.progressReportByProposal = action.payload.response.data
        .map(progressReport => ({
          status: progressReport[PARAMS.status],
          progressReportTitle: progressReport[PARAMS.progressReportTitle],
          projectTitle: progressReport[PARAMS.proposalTitle],
          contributorAddress: progressReport[PARAMS.contributorAddress],
          timestamp: progressReport[PARAMS.timestamp],
          ipfsHash: progressReport[PARAMS.reportHash],
          reportKey: progressReport[PARAMS.reportHash],
          proposalKey: progressReport[PARAMS.proposalHash],
          sponsoredTimestamp: progressReport[PARAMS.sponsoredTimestamp],

          approvedVotes: IconConverter.toBigNumber(
            progressReport[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(
            progressReport[PARAMS.totalVotes],
          ),

          approvedPercentage: calculatePercentage({
            total: progressReport[PARAMS.totalVotes],
            actual: progressReport[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: progressReport[PARAMS.totalVoters],
            actual: progressReport[PARAMS.approvedVoters],
          }),
          rejectedPercentage: calculatePercentage({
            total: progressReport[PARAMS.totalVotes],
            actual: progressReport[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: progressReport[PARAMS.totalVoters],
            actual: progressReport[PARAMS.rejectedVoters],
          }),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      state.progressReportByProposal = state.progressReportByProposal.filter(
        progressReport => progressReport.progressReportTitle !== '',
      );
      return;
    },
    fetchProgressReportByProposalFailure() {
      return;
    },

    fetchRemainingVotesPRSuccess(state, action) {
      // state.progressReportList = action.payload
      // state.progressReportList = progressReportList.map(progressReport);

      state.remainingVotes = action.payload.response
        .map(progressReport => ({
          status: progressReport[PARAMS.status],
          progressReportTitle: progressReport[PARAMS.progressReportTitle],
          projectTitle: progressReport[PARAMS.proposalTitle],
          contributorAddress: progressReport[PARAMS.contributorAddress],
          timestamp: progressReport[PARAMS.timestamp],
          ipfsHash: progressReport[PARAMS.reportHash],
          reportKey: progressReport[PARAMS.reportHash],
          proposalKey: progressReport[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            progressReport[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(
            progressReport[PARAMS.totalVotes],
          ),
          // approvedPercentage: (!progressReport[PARAMS.totalVotes] || parseInt(progressReport[PARAMS.totalVotes]) === 0) ? 0 : ((progressReport[PARAMS.approvedVotes] / progressReport[PARAMS.totalVotes]) * 100)
          approvedPercentage: calculatePercentage({
            total: progressReport[PARAMS.totalVotes],
            actual: progressReport[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: progressReport[PARAMS.totalVoters],
            actual: progressReport[PARAMS.approvedVoters],
          }),
          rejectedPercentage: calculatePercentage({
            total: progressReport[PARAMS.totalVotes],
            actual: progressReport[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: progressReport[PARAMS.totalVoters],
            actual: progressReport[PARAMS.rejectedVoters],
          }),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    },
    fetchProgressReportByIpfsRequest(state) {
      return;
    },
    fetchProgressReportByIpfsSuccess(state, action) {
      console.log('Response', action.payload.response);
      let progressReport = action.payload.response;
      state.selectedProgressReport = {
        status: progressReport[PARAMS.status],
        progressReportTitle: progressReport[PARAMS.progressReportTitle],
        projectTitle: progressReport[PARAMS.proposalTitle],
        contributorAddress: progressReport[PARAMS.contributorAddress],
        timestamp: progressReport[PARAMS.timestamp],
        sponsoredTimestamp: progressReport[PARAMS.sponsoredTimestamp],
        ipfsHash: progressReport[PARAMS.reportHash],
        reportKey: progressReport[PARAMS.reportHash],
        proposalKey: progressReport[PARAMS.proposalHash],
        approvedVotes: IconConverter.toBigNumber(
          progressReport[PARAMS.approvedVotes],
        ),
        totalVotes: IconConverter.toBigNumber(
          progressReport[PARAMS.totalVotes],
        ),
        approvedPercentage: calculatePercentage({
          total: progressReport[PARAMS.totalVotes],
          actual: progressReport[PARAMS.approvedVotes],
        }),
        approvedVotesPercentageCount: calculatePercentage({
          total: progressReport[PARAMS.totalVoters],
          actual: progressReport[PARAMS.approvedVoters],
        }),

        rejectedPercentage: calculatePercentage({
          total: progressReport[PARAMS.totalVotes],
          actual: progressReport[PARAMS.rejectedVotes],
        }),
        rejectedVotesPercentageCount: calculatePercentage({
          total: progressReport[PARAMS.totalVoters],
          actual: progressReport[PARAMS.rejectedVoters],
        }),
      };
    },
    fetchProgressReportByIpfsFailure(state) {
      return;
    },
    fetchChangeVoteRequestProgressReport(state) {
      return;
    },
    fetchChangeVoteSuccess(state, action) {
      const status = Number(action.payload.response);
      if (!status) {
        state.changeVote = true;
      } else {
        state.changeVote = false;
      }
    },
    fetchChangeVoteFailure(state) {
      state.changeVote = false;
      return;
    },
  },
});

export const {
  submitProgressReportRequest,
  submitProgressReportSuccess,
  submitProgressReportFailure,
  fetchProgressReportListRequest,
  fetchProgressReportListSuccess,
  fetchProgressReportListFailure,
  fetchProgressReportDetailRequest,
  fetchProgressReportDetailSuccess,
  fetchProgressReportDetailFailure,
  saveDraftRequest,
  saveDraftSuccess,
  saveDraftFailure,
  fetchDraftsRequest,
  fetchDraftsSuccess,
  fetchDraftsFailure,
  setModalShowVotingPR,
  voteProgressReport,
  fetchVoteResultRequest,
  fetchVoteResultSuccess,
  fetchVoteResultFailure,
  fetchProgressReportByProposalRequest,
  fetchProgressReportByProposalSuccess,
  fetchProgressReportByProposalFailure,
  fetchRemainingVotesPRSuccess,
  fetchVoteResultBudgetChangeRequest,
  fetchVoteResultBudgetChangeSuccess,
  fetchVoteResultBudgetChangeFailure,
  setSubmittingProgressReport,
  fetchProgressReportByIpfsRequest,
  fetchProgressReportByIpfsSuccess,
  fetchProgressReportByIpfsFailure,
  emptyProgressReportDetailRequest,
  emptyProgressReportDetailSuccess,
  emptyProposalReportDetailFailure,
  fetchChangeVoteRequestProgressReport,
  fetchChangeVoteSuccess,
  fetchChangeVoteFailure,
} = proposalSlice.actions;
export default proposalSlice.reducer;
