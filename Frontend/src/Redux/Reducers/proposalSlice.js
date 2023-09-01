import { createSlice } from '@reduxjs/toolkit';
import { IconConverter } from 'icon-sdk-js';
import { proposalStatusMapping } from 'Constants';
import { voteProgressReport } from './progressReportSlice';
import { calculatePercentage } from 'Helpers';

const PARAMS = {
  status: 'status',
  proposalTitle: 'project_title',
  contributorAddress: 'contributor_address',
  totalBudget: 'total_budget',
  timestamp: 'timestamp',
  sponsoredTimestamp: 'sponsored_timestamp',
  proposalHash: 'ipfs_hash',

  approvedVotes: 'approved_votes',
  approvedReports: 'approved_reports',
  totalVotes: 'total_votes',
  rejectedVotes: 'rejected_votes',

  approvedVoters: 'approve_voters',
  totalVoters: 'total_voters',
  rejectedVoters: 'reject_voters',

  percentageCompleted: 'percentage_completed',

  newProgressReport: 'new_progress_report',
  lastProgressReport: 'last_progress_report',

  sponsorVoteReason: 'sponsor_vote_reason',
  projectDuration: 'project_duration',
  token: 'token',
  submitProgressReport: 'submitProgressReport',
};

export const VotingPhase = {
  IDLE: 'Idle',
  START: 'Start',
  SIGNING: 'Signing',
  AUTHORIZING: 'Authorizing',
};

const initialState = {
  numberOfSubmittedProposals: 29,
  totalSubmittedProposalBudget: 1240000,

  numberOfApprovedProposals: 29,
  totalApprovedProposalBudget: 1240000,

  numberOfPendingProposals: 235,
  totalPendingProposalBudge: 42900,
  cpfRemainingFunds: { icx: 0, bnUSD: 0 },
  submittingProposal: false,
  proposalDetail: null,
  modalShowSponsorRequests: false,
  modalShowVoting: false,
  votingPhase: VotingPhase.IDLE,

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
  proposalListLoading: false,

  proposalHistoryList: [],
  proposalHistoryListCount: 0,

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
  sponsorRequestIPFSKey: '',
  sponsorRequestProposalTitle: '',
  sponsorRequestProposal: null,
  selectedProposal: {},
  token: '',
  error: '',
  changeVote: false,
  priorityVoting: false,
};

const proposalSlice = createSlice({
  name: 'proposal',
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

    fetchSortPriorityProposalListRequest(state) {
      return;
    },
    fetchSortPriorityProposalListSuccess(state, action) {
      state.proposalList['Voting'][0] = action.payload.response.map(
        proposal => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget],
          ).dividedBy(10 ** 18),
          _timestamp: proposal[PARAMS.timestamp],
          _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration],
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
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
          ),
          token: proposal[PARAMS.token],
          // if(parseInt(totalVoters) === 0) {
          //     return 0;
          //   }
          //   return (approvedVoters/totalVoters) * 100;
        }),
      );
      console.log(action.payload.status);
      // state.totalPages[action.payload.status] = Math.ceil(IconConverter.toNumber(action.payload.response[0].count) / 10)
      state.totalPages[action.payload.status] = Math.ceil(
        IconConverter.toNumber(action.payload.response.count) / 10,
      );
      state.totalCount[action.payload.status] = IconConverter.toNumber(
        action.payload.response.count,
      );
    },
    fetchSortPriorityProposalListFailure(state) {
      return;
    },

    fetchProposalListRequest(state) {
      state.proposalListLoading = true;
      return;
    },
    fetchProposalListSuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.
      state.proposalListLoading = false;
      console.log(action.payload.response.data);

      state.proposalList[action.payload.status][action.payload.pageNumber - 1] =
        action.payload.response.data
          .map(proposal => ({
            _status: proposal[PARAMS.status],
            _proposal_title: proposal[PARAMS.proposalTitle],
            _contributor_address: proposal[PARAMS.contributorAddress],
            // budget: parseInt(proposal[PARAMS.totalBudget]),
            budget: IconConverter.toBigNumber(
              proposal[PARAMS.totalBudget],
            ).dividedBy(10 ** 18),
            _timestamp: proposal[PARAMS.timestamp],
            _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
            ipfsHash: proposal[PARAMS.proposalHash],
            ipfsKey: proposal[PARAMS.proposalHash],
            approvedVotes: IconConverter.toBigNumber(
              proposal[PARAMS.approvedVotes],
            ),
            totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
            projectDuration: IconConverter.toBigNumber(
              proposal[PARAMS.projectDuration],
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
              IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
            ),
            token: proposal[PARAMS.token],
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
        IconConverter.toNumber(action.payload.response.count) / 10,
      );
      state.totalCount[action.payload.status] = IconConverter.toNumber(
        action.payload.response.count,
      );

      return;
    },
    fetchProposalListFailure(state) {
      state.proposalListLoading = false;
      return;
    },

    fetchProposalHistoryRequest(state) {
      state.proposalListLoading = true;
      return;
    },
    fetchProposalHistorySuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.
      state.proposalListLoading = false;
      // console.log('History data', action.payload.response);

      state.proposalHistoryList = action.payload.response.data.map(
        proposal => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget],
          ).dividedBy(10 ** 18),
          _timestamp: proposal[PARAMS.timestamp],
          _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration],
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
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
          ),
          token: proposal[PARAMS.token],
          // if(parseInt(totalVoters) === 0) {
          //     return 0;
          //   }
          //   return (approvedVoters/totalVoters) * 100;
        }),
      );
      // .sort((a, b) => b._timestamp - a._timestamp);

      state.proposalHistoryListCount = IconConverter.toNumber(
        action.payload.response.count,
      );

      return;
    },
    fetchProposalHistoryFailure(state) {
      state.proposalListLoading = false;
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
    fetchProposalDetailFailure(state) {
      state.error = true;
    },
    emptyProposalDetailRequest() {
      return;
    },
    emptyProposalDetailSuccess(state) {
      delete state.proposalDetail;
      state.error = '';
      state.selectedProposal = null;
    },
    emptyProposalDetailFailure() {
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
        .map(proposal => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget],
          ).dividedBy(10 ** 18),

          _timestamp: proposal[PARAMS.timestamp],
          _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration],
          ),

          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes],
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
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
          ),
          token: proposal[PARAMS.token],
        }))
        .sort((a, b) => b._timestamp - a._timestamp);
      state.totalPagesSponsorRequests[action.payload.status] = Math.ceil(
        IconConverter.toNumber(action.payload.response.count) / 10,
      );
      state.totalCountSponsorRequests[action.payload.status] =
        IconConverter.toNumber(action.payload.response.count);

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
      state.proposalList['Draft'] = action.payload.response.map(
        (proposal, index) => ({
          // projectName: proposal.proposalName,
          // ipfsHash: proposal.ipfsHash,
          // _status: 'draft',||

          _status: 'draft',
          _proposal_title: proposal.proposalName || 'Untitled Proposal',
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
        }),
      );
    },
    fetchDraftsFailure(state) {
      return;
    },

    fetchProposalByAddressRequest(state) {
      return;
    },

    fetchProposalByAddressSuccess(state, action) {
      console.group('fetchProposalByAddressSuccess');
      console.log('fetchProposalByAddressSuccess');
      console.groupEnd();
      state.proposalByAddress = action.payload.response.map(proposal => ({
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
    setVotingPhase(state, action) {
      state.votingPhase = action.payload;
    },
    setModalShowVoting(state, action) {
      state.modalShowVoting = action.payload;
    },

    fetchVoteResultRequest() {
      return;
    },
    fetchVoteResultSuccess(state, action) {
      state.votesByProposal = action.payload.response.data.map(vote => ({
        sponsorAddress: vote.address,
        status: proposalStatusMapping.find(
          mapping => mapping.status === vote.vote,
        )?.name,
        timestamp: vote._timestamp,
        prepName: vote.prep_name,
        reason: vote.vote_reason,
      }));
      state.votesByProposal = state.votesByProposal.filter(vote => vote.status);

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

    fetchProjectAmountsRequest(state) {
      return;
    },
    fetchProjectAmountsSuccess(state, action) {
      // state.proposalList = action.payload
      // state.proposalList.
      for (const proposalStatus of proposalStatusMapping) {
        state.projectAmounts[proposalStatus.name] = {
          amount: {
            icx: parseFloat(
              IconConverter.toBigNumber(
                action.payload[proposalStatus.status]?._total_amount.ICX ?? 0,
              ).dividedBy(10 ** 18),
            ),
            bnUSD: parseFloat(
              IconConverter.toBigNumber(
                action.payload[proposalStatus.status]?._total_amount.bnUSD ?? 0,
              ).dividedBy(10 ** 18),
            ),
          },
          count: parseInt(
            IconConverter.toBigNumber(
              action.payload[proposalStatus.status]?._count ?? 0,
            ),
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
        .map(proposal => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget],
          ).dividedBy(10 ** 18),

          _timestamp: proposal[PARAMS.timestamp],
          _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration],
          ),
          submitProgressReport: Boolean(
            Number(proposal[PARAMS.submitProgressReport]),
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
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
          ),
          token: proposal[PARAMS.token],
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
        IconConverter.toNumber(action.payload.response.count) / 10,
      );
      state.totalCount[action.payload.status] = IconConverter.toNumber(
        action.payload.response.count,
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
        .map(proposal => ({
          _status: proposal[PARAMS.status],
          _proposal_title: proposal[PARAMS.proposalTitle],
          _contributor_address: proposal[PARAMS.contributorAddress],
          // budget: parseInt(proposal[PARAMS.totalBudget]),
          budget: IconConverter.toBigNumber(
            proposal[PARAMS.totalBudget],
          ).dividedBy(10 ** 18),
          _timestamp: proposal[PARAMS.timestamp],
          _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
          ipfsHash: proposal[PARAMS.proposalHash],
          ipfsKey: proposal[PARAMS.proposalHash],
          approvedVotes: IconConverter.toBigNumber(
            proposal[PARAMS.approvedVotes],
          ),
          totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
          sponsorVoteReason: proposal[PARAMS.sponsorVoteReason],
          projectDuration: IconConverter.toBigNumber(
            proposal[PARAMS.projectDuration],
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
            IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
          ),
          token: proposal[PARAMS.token],
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
    fetchProposalByIpfsRequest(state) {
      return;
    },
    fetchProposalByIpfsSuccess(state, action) {
      console.log('Response', action.payload.response);
      let proposal = action.payload.response;
      state.selectedProposal = {
        _status: proposal[PARAMS.status],
        _proposal_title: proposal[PARAMS.proposalTitle],
        _contributor_address: proposal[PARAMS.contributorAddress],
        // budget: parseInt(proposal[PARAMS.totalBudget]),
        budget: IconConverter.toBigNumber(
          proposal[PARAMS.totalBudget],
        ).dividedBy(10 ** 18),
        _timestamp: proposal[PARAMS.timestamp],
        _sponsored_timestamp: proposal[PARAMS.sponsoredTimestamp],
        ipfsHash: proposal[PARAMS.proposalHash],
        ipfsKey: proposal[PARAMS.proposalHash],
        approvedVotes: IconConverter.toBigNumber(
          proposal[PARAMS.approvedVotes],
        ),
        totalVotes: IconConverter.toBigNumber(proposal[PARAMS.totalVotes]),
        projectDuration: IconConverter.toBigNumber(
          proposal[PARAMS.projectDuration],
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
          IconConverter.toBigNumber(proposal[PARAMS.percentageCompleted]),
        ),
        token: proposal[PARAMS.token],
        approvedReports: proposal['approved_reports'],
        projectDuration: proposal['project_duration'],
      };
      return;
    },
    fetchProposalByIpfsFailure(state) {
      return;
    },

    setBackendTriggerData(state, action) {
      state.backendTriggerData = action.payload;
      return;
    },
    fetchChangeVoteRequest(state) {
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
    submitPriorityVotingRequest(state) {
      return;
    },
    fetchPriorityVotingRequest(state) {
      return;
    },
    fetchPriorityVotingSuccess(state, action) {
      state.priorityVoting = action.payload;
      return;
    },
    fetchPriorityVotingFailure(state, action) {
      state.priorityVoting = false;
      return;
    },
  },

  extraReducers: {
    'account/logout': (state, action) => {
      state.myProposalList = [];
    },
  },
});

export const {
  submitProposalRequest,
  submitProposalSuccess,
  submitProposalFailure,
  fetchSortPriorityProposalListRequest,
  fetchSortPriorityProposalListSuccess,
  fetchSortPriorityProposalListFailure,
  fetchProposalListRequest,
  fetchProposalListSuccess,
  fetchProposalListFailure,

  fetchProposalHistoryRequest,
  fetchProposalHistorySuccess,
  fetchProposalHistoryFailure,

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
  fetchProposalByIpfsFailure,
  fetchProposalByIpfsSuccess,
  fetchProposalByIpfsRequest,
  emptyProposalDetailSuccess,
  emptyProposalDetailRequest,
  emptyProposalDetailFailure,
  setBackendTriggerData,
  fetchChangeVoteRequest,
  fetchChangeVoteSuccess,
  fetchChangeVoteFailure,
  submitPriorityVotingRequest,
  fetchPriorityVotingRequest,
  fetchPriorityVotingSuccess,
  fetchPriorityVotingFailure,
  setVotingPhase,
} = proposalSlice.actions;
export default proposalSlice.reducer;
