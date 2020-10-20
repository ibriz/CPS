import { createSelector } from 'reselect'

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
