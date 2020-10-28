import { createSlice } from '@reduxjs/toolkit';

import {IconConverter} from 'icon-sdk-js';
import {progressReportStatusMapping as progressReportMapping} from 'Constants';

const progressReportList = [
    {
        _title: "Approved 0 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_approved',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Approved 1 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_approved',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Approved 2 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_approved',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Rejected 3 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_rejected',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Rejected 4 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_rejected',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Approved 5 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_approved',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Voting 1 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_voting',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Voting 1 Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_voting',
        _ifps_hash: 'abcd'
    },

    {
        _title: "Voting 2 Progress Report",
        _project_title: "Contribute from Ecosystem Fund to Gitcoin Grants Round 7",
        _timestamp: 1600872145290985,
        _status: '_voting',
        _ifps_hash: 'abcd'
    },


]

const progressReportStatusMapping = {
    '_rejected': 'Rejected',
    '_approved': 'Approved',
    '_waiting': 'Voting'
}

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
        Draft: []
    },

    progressReportDetail: null,

    totalPages: {
        Approved: [],
        Rejected: [],
        Voting: []
    },
    error: null,
    votesByProgressReport: [],

    progressReportByProposal: []
};

const proposalSlice = createSlice({
    name: 'progressReport',
    initialState,
    reducers: {
        submitProgressReportRequest(state) {
            state.submittingProgressReport = true
        },
        submitProgressReportSuccess(state) {
            state.submittingProgressReport = false
        },
        submitProgressReportFailure(state) {
            state.submittingProgressReport = false
        },

        fetchProgressReportListRequest(state) {
            return;
        },
        fetchProgressReportListSuccess(state, action) {
            // state.progressReportList = action.payload
            // state.progressReportList = progressReportList.map(progressReport);

                state.progressReportList[action.payload.status][action.payload.pageNumber - 1] = action.payload.response.data.map (
                    progressReport => (
                        {
                            status: progressReport._status,
                            progressReportTitle: progressReport._project_report_title,
                            projectTitle: progressReport._proposal_title,
                            contributorAddress: progressReport._contributor_address,
                            timestamp: progressReport._timestamp,
                            ipfsHash: progressReport._ipfs_hash,
                            reportKey: progressReport._report_key,
                            proposalKey: progressReport._ipfs_key
                        }
                    )
                );
                state.totalPages[action.payload.status] = Math.ceil(IconConverter.toNumber(action.payload.response.count) / 10)

        },
        fetchProgressReportListFailure(state, action) {
            state.error = action.payload;
        },

        fetchProgressReportDetailRequest() {
            return;
        },

        fetchProgressReportDetailSuccess(state, action) {
            state.progressReportDetail =  action.payload.response;
        },

        fetchProgressReportDetailFailure() {
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
            state.progressReportList["Draft"] = payload.payload.response.data;
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
            state.votesByProgressReport = action.payload.response.data.map(vote => (
                {
                    sponsorAddress: vote.address,
                    status: progressReportMapping.find(mapping =>
                        mapping.status === vote.vote)?.name,
                    timestamp: vote._timestamp
                }
            ));
            state.votesByProgressReport = state.votesByProgressReport.filter(vote => 
                vote.status);
                state.approvedVotes = IconConverter.toBigNumber(action.payload.response.approved_votes);
                state.totalVotes = IconConverter.toBigNumber(action.payload.response.total_votes);
                state.rejectedVotes = IconConverter.toBigNumber(action.payload.response.rejected_votes);
    
                state.approvedVoters = IconConverter.toBigNumber(action.payload.response.approve_voters);
                state.rejectedVoters = IconConverter.toBigNumber(action.payload.response.reject_voters);
                state.totalVoters = IconConverter.toBigNumber(action.payload.response.total_voters);

            
            return;
        },  
        fetchVoteResultFailure() {
            return;
        }, 
        
        fetchProgressReportByProposalRequest() {
            return;
        },
        fetchProgressReportByProposalSuccess(state, action){
            state.progressReportByProposal = action.payload.response.data.map(progressReport => (
                {
                    progressReportTitle: progressReport._project_report_title,
                    // projectTitle: 'New Proposal',
                    timestamp: progressReport._timestamp,
                    // ipfsHash: 'bafybeidtxjlihr5rxkbtpa2smuwq7skj7gysuctaohx5lpwju26qt3k2ha',
                    // status: progressReportMapping.find(mapping =>
                    //     mapping.status === progressReport._status)?.name,
                    status: progressReport._status
                }
            ));
            state.progressReportByProposal = state.progressReportByProposal.filter(progressReport =>
                progressReport.progressReportTitle !== '')
            return;
        },
        fetchProgressReportByProposalFailure(){
            return;
        },

    },
})

export const { submitProgressReportRequest, submitProgressReportSuccess, submitProgressReportFailure,
    fetchProgressReportListRequest, fetchProgressReportListSuccess, fetchProgressReportListFailure,
fetchProgressReportDetailRequest, fetchProgressReportDetailSuccess, fetchProgressReportDetailFailure,
saveDraftRequest, saveDraftSuccess, saveDraftFailure,
fetchDraftsRequest, fetchDraftsSuccess, fetchDraftsFailure, setModalShowVotingPR,
voteProgressReport, 
fetchVoteResultRequest, fetchVoteResultSuccess, fetchVoteResultFailure,
fetchProgressReportByProposalRequest, fetchProgressReportByProposalSuccess,
fetchProgressReportByProposalFailure} = proposalSlice.actions;
export default proposalSlice.reducer;