import { createSelector } from 'reselect';
import {proposalStatusMapping} from 'Constants';

const getProposalList = state => state.proposals.proposalList
const getWalletAddress = state => state.account.address

export const getCurrentUserActiveProposals = createSelector(
  [getProposalList, getWalletAddress],
  (proposalList, walletAddress) => {
    return proposalList.Active.filter((proposal) => 
        proposal._contributor_address === walletAddress
    )
    }
)

const getApprovedVotes = state => state.proposals.approvedVotes
const getTotalVotes = state => state.proposals.totalVotes

export const getProposalApprovedPercentage = createSelector(
  [getApprovedVotes, getTotalVotes],
  (approvedVotes, totalVotes) => {
    if(parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes/totalVotes) * 100;
  }
);

const getApprovedVoters = state => state.proposals.approvedVoters
const getTotalVoters = state => state.proposals.totalVoters

export const getProposalApprovedVotersPercentage = createSelector(
  [getApprovedVoters, getTotalVoters],
  (approvedVoters, totalVoters) => {
    if(parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters/totalVoters) * 100;
  }
);

const getApprovedVotesPR = state => state.progressReport.approvedVotes
const getTotalVotesPR = state => state.progressReport.totalVotes

export const getProgressReportApprovedPercentage = createSelector(
  [getApprovedVotesPR, getTotalVotesPR],
  (approvedVotes, totalVotes) => {
    if(parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes/totalVotes) * 100;
  }
);

const getApprovedVotersPR = state => state.progressReport.approvedVoters
const getTotalVotersPR = state => state.progressReport.totalVoters

export const getProgressReportApprovedVotersPercentage = createSelector(
  [getApprovedVotersPR, getTotalVotersPR],
  (approvedVoters, totalVoters) => {
    if(parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters/totalVoters) * 100;
  }
);


const getApprovedVotesBudgetAdjustment = state => state.progressReport.approvedVotes
const getTotalVotesBudgetAdjustment = state => state.progressReport.totalVotes

export const getBudgetAdjustmentApprovedPercentage = createSelector(
  [getApprovedVotesBudgetAdjustment, getTotalVotesBudgetAdjustment],
  (approvedVotes, totalVotes) => {
    if(parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes/totalVotes) * 100;
  }
);

const getApprovedVotersBudgetAdjustment = state => state.progressReport.approvedVoters
const getTotalVotersBudgetAdjustment = state => state.progressReport.totalVoters
a
export const getBudgetAdjustmentApprovedVotersPercentage = createSelector(
  [getApprovedVotersBudgetAdjustment, getTotalVotersBudgetAdjustment],
  (approvedVoters, totalVoters) => {
    if(parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters/totalVoters) * 100;
  }
);


const getProposalByAddress = state => state.proposals.proposalByAddress

export const getNewProgressReportInfo = createSelector(
  [getProposalByAddress],
  (proposalByAddress) => {
    const canCreateNewProgressReportCount = proposalByAddress.filter(proposal => proposal.newProgressReport).length;
    const totalProgressReportCount = proposalByAddress.length;
    return {
      canCreateNewProgressReportCount,
      totalProgressReportCount,
      canCreateNewProgressReport: canCreateNewProgressReportCount > 0
    }
  }
);


const getMyProposals = state => state.proposals.myProposalList


export const getProposalPendingProgressReport = createSelector(
  [getProposalByAddress, getMyProposals],
  (proposalByAddress, myProposals) => {

    const activePausedProposals = myProposals.filter(proposal => {
      const status = proposalStatusMapping.find(mapping => mapping.status === proposal._status).name;
      return (status === 'Active' || status === 'Paused' );

    });
    const proposalPendingProgressReport = activePausedProposals.filter(proposal => proposalByAddress.find(item => item.ipfsKey === proposal.ipfsKey)?.newProgressReport === true );
    return proposalPendingProgressReport;
  }
);
