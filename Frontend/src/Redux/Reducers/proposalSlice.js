import { createSlice } from "@reduxjs/toolkit";
import { IconConverter } from "icon-sdk-js";
import { proposalStatusMapping } from "Constants";
import { voteProgressReport } from "./progressReportSlice";
import { calculatePercentage } from "Helpers";

const PARAMS = {
  status: "status",
  proposalTitle: "project_title",
  contributorAddress: "contributor_address",
  totalBudget: "total_budget",
  timestamp: "timestamp",
  proposalHash: "ipfs_hash",

  approvedVotes: "approved_votes",
  totalVotes: "total_votes",
  rejectedVotes: "rejected_votes",

  approvedVoters: "approve_voters",
  totalVoters: "total_voters",
  rejectedVoters: "reject_voters",

  percentageCompleted: "percentage_completed",

  newProgressReport: "new_progress_report",
  lastProgressReport: "last_progress_report",

  sponsorVoteReason: "sponsor_vote_reason",
  projectDuration: "project_duration",
};

const initialState = {
  numberOfSubmittedProposals: 29,
  totalSubmittedProposalBudget: 1240000,

  numberOfApprovedProposals: 29,
  totalApprovedProposalBudget: 1240000,

  numberOfPendingProposals: 235,
  totalPendingProposalBudge: 42900,
  cpfRemainingFunds: 549300,
  submittingProposal: false,
  proposalDetail: null,
  modalShowSponsorRequests: false,
  modalShowVoting: false,

  proposalList: {
    Active: [],
    Voting: [],
    Completed: [],
    Pending: [],
    Disqualified: [],
    Paused: [],
    Rejected: [],
    Draft: [],
  },

  myProposalList: [],

  totalPages: {
    Active: 0,
    Voting: 0,
    Completed: 0,
    Pending: 0,
    Disqualified: 0,
    Paused: 0,
    Rejected: 0,
  },

  totalCount: {
    Active: 0,
    Voting: 0,
    Completed: 0,
    Pending: 0,
    Disqualified: 0,
    Paused: 0,
    Rejected: 0,
  },

  sponsorRequestsList: {
    Pending: [],
    Approved: [],
    Rejected: [],
    Disqualified: [],
  },

  totalPagesSponsorRequests: {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Disqualified: 0,
  },

  totalCountSponsorRequests: {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Disqualified: 0,
  },

  proposalByAddress: [],

  votesByProposal: [],

  projectAmounts: {
    Active: {
      amount: 0,
      count: 0,
    },
    Voting: {
      amount: 0,
      count: 0,
    },
    Completed: {
      amount: 0,
      count: 0,
    },
    Pending: {
      amount: 0,
      count: 0,
    },
    Disqualified: {
      amount: 0,
      count: 0,
    },
    Paused: {
      amount: 0,
      count: 0,
    },
    Rejected: {
      amount: 0,
      count: 0,
    },
  },

  remainingVotes: [],
  sponsorMessage: [],
  sponsorRequestIPFSKey: "",
  sponsorRequestProposalTitle: "",
  sponsorRequestProposal: null,
};

const proposalSlice = createSlice({
  name: "proposal",
  initialState,
  reducers: {
    submitProposalRequest(state) {},
    submitProposalSuccess(state) {
      state.submittingProposal = false;
    },
    submitProposalFailure(state) {
      state.submittingProposal = false;
    },

    setSubmittingProposal(state) {
      state.submittingProposal = true;
    },

    fetchProposalListRequest(state) {
      return;
    },
    fetchProposalListSuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.

      state.proposalList[action.payload.status][
        action.payload.pageNumber - 1
      ] = action.payload.response.data
        .map((proposal) => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget]
          ).dividedBy(10 ** 18),
          _timestamp: proposal[PARAMS.timestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes]
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration]
          ),

          sponsorVoteReason: proposal[PARAMS.sponsorVoteReason],
          // approvedPercentage: (!proposal[PARAMS.totalVotes] || parseInt(proposal[PARAMS.totalVotes]) === 0) ? 0 : ((proposal[PARAMS.approvedVotes] / proposal[PARAMS.totalVotes]) * 100),

          approvedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.approvedVoters],
          }),

          rejectedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.rejectedVoters],
          }),

          completedPercentage: parseInt(
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted])
          ),
          // if(parseInt(totalVoters) === 0) {
          //     return 0;
          //   }
          //   return (approvedVoters/totalVoters) * 100;
        }))
        .sort((a, b) => b._timestamp - a._timestamp);
      console.log(fetchProposalListSuccess);
      // console.log(Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10));
      console.log(action.payload.status);
      // state.totalPages[action.payload.status] = Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10)
      state.totalPages[action.payload.status] = Math.ceil(
        IconConverter.toNumber(action.payload.response.count) / 10
      );
      state.totalCount[action.payload.status] = IconConverter.toNumber(
        action.payload.response.count
      );

      return;
    },
    fetchProposalListFailure(state) {
      return;
    },
    updateProposalStatus(state, action) {
      return;
    },

    fetchProposalDetailRequest() {
      return;
    },

    fetchProposalDetailSuccess(state, payload) {
      state.proposalDetail = payload.payload.response;
    },

    fetchProposalDetailFailure() {
      return;
    },

    fetchSponsorRequestsListRequest(state) {
      return;
    },
    fetchSponsorRequestsListSuccess(state, action) {
      // state.proposalList[action.payload.status][action.payload.pageNumber - 1] = action.payload.response.data.map (
      //     proposal => (
      //         {
      //             _status: proposal._status,
      //             _proposal_title: proposal._proposal_title,
      //             _contributor_address: proposal._contributor_address,
      //             budget: proposal.budget,
      //             _timestamp: proposal._timestamp,
      //             ipfsHash: proposal._ipfs_hash,
      //             ipfsKey: proposal._ipfs_key
      //         }
      //     )
      // );
      // console.log(fetchProposalListSuccess);
      // // console.log(Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10));
      // console.log(action.payload.status);
      // // state.totalPages[action.payload.status] = Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10)
      // state.totalPages[action.payload.status] = Math.ceil(IconConverter.toNumber(action.payload.response.count) / 10)
      // return;

      state.sponsorRequestsList[action.payload.status][
        action.payload.pageNumber - 1
      ] = action.payload.response.data
        .map((proposal) => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget]
          ).dividedBy(10 ** 18),

          _timestamp: proposal[PARAMS.timestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration]
          ),

          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes]
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          sponsorVoteReason: proposal[PARAMS.sponsorVoteReason],
          // approvedPercentage: (!proposal[PARAMS.totalVotes] || parseInt(proposal[PARAMS.totalVotes]) === 0) ? 0 : ((proposal[PARAMS.approvedVotes] / proposal[PARAMS.totalVotes]) * 100),

          approvedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.approvedVoters],
          }),

          rejectedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.rejectedVoters],
          }),

          completedPercentage: parseInt(
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted])
          ),
        }))
        .sort((a, b) => b._timestamp - a._timestamp);
      state.totalPagesSponsorRequests[action.payload.status] = Math.ceil(
        IconConverter.toNumber(action.payload.response.count) / 10
      );
      state.totalCountSponsorRequests[
        action.payload.status
      ] = IconConverter.toNumber(action.payload.response.count);

      return;
    },
    fetchSponsorRequestsListFailure(state) {
      return;
    },

    approveSponserRequest(state) {
      return;
    },
    rejectSponsorRequest(state) {
      return;
    },

    voteProposal(state) {
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
    fetchDraftsSuccess(state, action) {
      state.proposalList["Draft"] = action.payload.response.map(
        (proposal, index) => ({
          // projectName: proposal.proposalName,
          // ipfsHash: proposal.ipfsHash,
          // _status: 'draft',||

          _status: "draft",
          _proposal_title: proposal.proposalName || "Untitled Proposal",
          ipfsHash: proposal.ipfsHash,
          ipfsUrl: proposal.ipfsUrl,
          ipfsKey: proposal.ipfsKey,
          _contributor_address: action.payload.contributorAddress,
          index,

          // budget: parseInt(proposal[PARAMS.totalBudget]),
          // _timestamp: proposal[PARAMS.timestamp],
          // ipfsKey: proposal[PARAMS.proposalHash],
          // approvedVotes: IconConverter.toBigNumber(proposal[PARAMS.approvedVotes]),
          // totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          // approvedPercentage: (!proposal[PARAMS.totalVotes] || parseInt(proposal[PARAMS.totalVotes]) === 0) ? 0 : ((proposal[PARAMS.approvedVotes] / proposal[PARAMS.totalVotes]) * 100),
          // completedPercentage: parseInt(IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted])),
        })
      );
    },
    fetchDraftsFailure(state) {
      return;
    },

    fetchProposalByAddressRequest(state) {
      return;
    },

    fetchProposalByAddressSuccess(state, action) {
      console.group("fetchProposalByAddressSuccess");
      console.log("fetchProposalByAddressSuccess");
      console.groupEnd();
      state.proposalByAddress = action.payload.response.map((proposal) => ({
        _proposal_title: proposal[PARAMS.proposalTitle],
        ipfsKey: proposal[PARAMS.proposalHash],
        newProgressReport: !parseInt(proposal[PARAMS.newProgressReport]),
        lastProgressReport: !!parseInt(proposal[PARAMS.lastProgressReport]),
      }));
      return;
    },

    fetchProposalByAddressFailure(state) {
      return;
    },
    setModalShowSponsorRequests(state, action) {
      state.modalShowSponsorRequests = action.payload;
    },
    setModalShowVoting(state, action) {
      state.modalShowVoting = action.payload;
    },

    fetchVoteResultRequest() {
      return;
    },
    fetchVoteResultSuccess(state, action) {
      state.votesByProposal = action.payload.response.data.map((vote) => ({
        sponsorAddress: vote.address,
        status: proposalStatusMapping.find(
          (mapping) => mapping.status === vote.vote
        )?.name,
        timestamp: vote._timestamp,
        prepName: vote.prep_name,
        reason: vote.vote_reason,
      }));
      state.votesByProposal = state.votesByProposal.filter(
        (vote) => vote.status
      );

      state.approvedVotes = IconConverter.toBigNumber(
        action.payload.response.approved_votes
      );
      state.totalVotes = IconConverter.toBigNumber(
        action.payload.response.total_votes
      );
      state.rejectedVotes = IconConverter.toBigNumber(
        action.payload.response.rejected_votes
      );

      state.approvedVoters = IconConverter.toBigNumber(
        action.payload.response.approve_voters
      );
      state.rejectedVoters = IconConverter.toBigNumber(
        action.payload.response.reject_voters
      );
      state.totalVoters = IconConverter.toBigNumber(
        action.payload.response.total_voters
      );

      return;
    },
    fetchVoteResultFailure() {
      return;
    },

    fetchProjectAmountsRequest(state) {
      return;
    },
    fetchProjectAmountsSuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.
      for (const proposalStatus of proposalStatusMapping) {
        state.projectAmounts[proposalStatus.name] = {
          amount: parseFloat(
            IconConverter.toBigNumber(
              action.payload[proposalStatus.status]?._total_amount ?? 0
            ).dividedBy(10 ** 18)
          ),
          count: parseInt(
            IconConverter.toBigNumber(
              action.payload[proposalStatus.status]?._count ?? 0
            )
          ),
        };
      }
      return;
    },
    fetchProjectAmountsFailure(state) {
      return;
    },

    fetchMyProposalListRequest(state) {
      return;
    },
    fetchMyProposalListSuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.

      state.myProposalList = action.payload.response.data
        .map((proposal) => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget]
          ).dividedBy(10 ** 18),

          _timestamp: proposal[PARAMS.timestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes]
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration]
          ),

          sponsorVoteReason: proposal[PARAMS.sponsorVoteReason],

          // approvedPercentage: (!proposal[PARAMS.totalVotes] || parseInt(proposal[PARAMS.totalVotes]) === 0) ? 0 : ((proposal[PARAMS.approvedVotes] / proposal[PARAMS.totalVotes]) * 100),

          approvedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.approvedVoters],
          }),

          rejectedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.rejectedVoters],
          }),

          completedPercentage: parseInt(
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted])
          ),
          // if(parseInt(totalVoters) === 0) {
          //     return 0;
          //   }
          //   return (approvedVoters/totalVoters) * 100;
        }))
        .sort((a, b) => b._timestamp - a._timestamp);
      console.log(fetchProposalListSuccess);
      // console.log(Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10));
      console.log(action.payload.status);
      // state.totalPages[action.payload.status] = Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10)
      state.totalPages[action.payload.status] = Math.ceil(
        IconConverter.toNumber(action.payload.response.count) / 10
      );
      state.totalCount[action.payload.status] = IconConverter.toNumber(
        action.payload.response.count
      );

      return;
    },
    fetchMyProposalListFailure(state) {
      return;
    },

    fetchRemainingVotesRequest(state) {
      return;
    },
    fetchRemainingVotesProposalSuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.

      state.remainingVotes = action.payload.response
        .map((proposal) => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget]
          ).dividedBy(10 ** 18),
          _timestamp: proposal[PARAMS.timestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes]
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          sponsorVoteReason: proposal[PARAMS.sponsorVoteReason],
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration]
          ),

          // approvedPercentage: (!proposal[PARAMS.totalVotes] || parseInt(proposal[PARAMS.totalVotes]) === 0) ? 0 : ((proposal[PARAMS.approvedVotes] / proposal[PARAMS.totalVotes]) * 100),

          approvedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.approvedVotes],
          }),
          approvedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.approvedVoters],
          }),

          rejectedPercentage: calculatePercentage({
            total: proposal[PARAMS.totalVotes],
            actual: proposal[PARAMS.rejectedVotes],
          }),
          rejectedVotesPercentageCount: calculatePercentage({
            total: proposal[PARAMS.totalVoters],
            actual: proposal[PARAMS.rejectedVoters],
          }),

          completedPercentage: parseInt(
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted])
          ),
          // if(parseInt(totalVoters) === 0) {
          //     return 0;
          //   }
          //   return (approvedVoters/totalVoters) * 100;
        }))
        .sort((a, b) => b._timestamp - a._timestamp);

      return;
    },
    fetchRemainingVotesFailure(state) {
      return;
    },
    fetchSponsorMessageRequest() {
      return;
    },
    fetchSponsorMessageSuccess(state, action) {
      state.sponsorMessage[action.payload.response.ipfsKey] =
        action.payload.response.message;
      return;
    },
    fetchSponsorMessageFailure() {
      return;
    },

    setSponsorRequestIPFSKey(state, action) {
      state.sponsorRequestIPFSKey = action.payload.ipfsKey;
      return;
    },

    setSponsorRequestProposalTitle(state, action) {
      state.sponsorRequestProposalTitle = action.payload.proposalTitle;
      return;
    },

    setSponsorRequestProposal(state, action) {
      state.sponsorRequestProposal = action.payload.proposal;
    },
  },

  extraReducers: {
    "account/logout": (state, action) => {
      state.myProposalList = [];
    },
  },
});

export const {
  submitProposalRequest,
  submitProposalSuccess,
  submitProposalFailure,
  fetchProposalListRequest,
  fetchProposalListSuccess,
  fetchProposalListFailure,
  updateProposalStatus,
  fetchProposalDetailRequest,
  fetchProposalDetailSuccess,
  fetchProposalDetailFailure,
  fetchSponsorRequestsListRequest,
  fetchSponsorRequestsListSuccess,
  fetchSponsorRequestsListFailure,
  approveSponserRequest,
  rejectSponsorRequest,
  saveDraftRequest,
  saveDraftSuccess,
  saveDraftFailure,
  fetchDraftsRequest,
  fetchDraftsSuccess,
  fetchDraftsFailure,
  voteProposal,
  fetchProposalByAddressRequest,
  fetchProposalByAddressSuccess,
  fetchProposalByAddressFailure,
  setModalShowSponsorRequests,
  setModalShowVoting,
  fetchVoteResultRequest,
  fetchVoteResultSuccess,
  fetchVoteResultFailure,
  fetchProjectAmountsRequest,
  fetchProjectAmountsSuccess,
  fetchProjectAmountsFailure,
  fetchMyProposalListRequest,
  fetchMyProposalListSuccess,
  fetchMyProposalListFailure,
  fetchRemainingVotesRequest,
  fetchRemainingVotesProposalSuccess,
  fetchRemainingVotesFailure,
  setSubmittingProposal,
  fetchSponsorMessageRequest,
  fetchSponsorMessageSuccess,
  fetchSponsorMessageFailure,
  setSponsorRequestIPFSKey,
  setSponsorRequestProposalTitle,
  setSponsorRequestProposal,
} = proposalSlice.actions;
export default proposalSlice.reducer;
