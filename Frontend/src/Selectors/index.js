import { createSelector } from 'reselect';
import { proposalStatusMapping } from 'Constants';

const getProposalList = state => state.proposals.proposalList;
const getWalletAddress = state => state.account.address;

export const getCurrentUserActiveProposals = createSelector(
  [getProposalList, getWalletAddress],
  (proposalList, walletAddress) => {
    return proposalList.Active.filter(
      proposal => proposal._contributor_address === walletAddress,
    );
  },
);

const getApprovedVotes = state => state.proposals.approvedVotes;
const getTotalVotes = state => state.proposals.totalVotes;

export const getProposalApprovedPercentage = createSelector(
  [getApprovedVotes, getTotalVotes],
  (approvedVotes, totalVotes) => {
    if (parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes / totalVotes) * 100;
  },
);

const getApprovedVoters = state => state.proposals.approvedVoters;
const getTotalVoters = state => state.proposals.totalVoters;

export const getProposalApprovedVotersPercentage = createSelector(
  [getApprovedVoters, getTotalVoters],
  (approvedVoters, totalVoters) => {
    if (parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters / totalVoters) * 100;
  },
);

const getRejectedVotes = state => state.proposals.rejectedVotes;

export const getProposalRejectedPercentage = createSelector(
  [getRejectedVotes, getTotalVotes],
  (approvedVotes, totalVotes) => {
    if (parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes / totalVotes) * 100;
  },
);

const getRejectedVoters = state => state.proposals.rejectedVoters;

export const getProposalRejectedVotersPercentage = createSelector(
  [getRejectedVoters, getTotalVoters],
  (approvedVoters, totalVoters) => {
    if (parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters / totalVoters) * 100;
  },
);

const getApprovedVotesPR = state => state.progressReport.approvedVotes;
const getTotalVotesPR = state => state.progressReport.totalVotes;

export const getProgressReportApprovedPercentage = createSelector(
  [getApprovedVotesPR, getTotalVotesPR],
  (approvedVotes, totalVotes) => {
    if (parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes / totalVotes) * 100;
  },
);

const getApprovedVotersPR = state => state.progressReport.approvedVoters;
const getTotalVotersPR = state => state.progressReport.totalVoters;

export const getProgressReportApprovedVotersPercentage = createSelector(
  [getApprovedVotersPR, getTotalVotersPR],
  (approvedVoters, totalVoters) => {
    if (parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters / totalVoters) * 100;
  },
);

const getRejectedVotesPR = state => state.progressReport.rejectedVotes;

export const getProgressReportRejectedPercentage = createSelector(
  [getRejectedVotesPR, getTotalVotesPR],
  (approvedVotes, totalVotes) => {
    if (parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes / totalVotes) * 100;
  },
);

const getRejectedVotersPR = state => state.progressReport.rejectedVoters;

export const getProgressReportRejectedVotersPercentage = createSelector(
  [getRejectedVotersPR, getTotalVotersPR],
  (approvedVoters, totalVoters) => {
    if (parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters / totalVoters) * 100;
  },
);

const getApprovedVotesBudgetAdjustment = state =>
  state.progressReport.approvedVotesBudgetChange;
const getTotalVotesBudgetAdjustment = state =>
  state.progressReport.totalVotesBudgetChange;

export const getBudgetAdjustmentApprovedPercentage = createSelector(
  [getApprovedVotesBudgetAdjustment, getTotalVotesBudgetAdjustment],
  (approvedVotes, totalVotes) => {
    if (parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes / totalVotes) * 100;
  },
);

const getApprovedVotersBudgetAdjustment = state =>
  state.progressReport.approvedVotersBudgetChange;
const getTotalVotersBudgetAdjustment = state =>
  state.progressReport.totalVotersBudgetChange;

export const getBudgetAdjustmentApprovedVotersPercentage = createSelector(
  [getApprovedVotersBudgetAdjustment, getTotalVotersBudgetAdjustment],
  (approvedVoters, totalVoters) => {
    if (parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters / totalVoters) * 100;
  },
);

const getRejectedVotesBudgetAdjustment = state =>
  state.progressReport.rejectedVotesBudgetChange;

export const getBudgetAdjustmentRejectedPercentage = createSelector(
  [getRejectedVotesBudgetAdjustment, getTotalVotesBudgetAdjustment],
  (approvedVotes, totalVotes) => {
    if (parseInt(totalVotes) === 0) {
      return 0;
    }
    return (approvedVotes / totalVotes) * 100;
  },
);

const getRejectedVotersBudgetAdjustment = state =>
  state.progressReport.rejectedVotersBudgetChange;

export const getBudgetAdjustmentRejectedVotersPercentage = createSelector(
  [getRejectedVotersBudgetAdjustment, getTotalVotersBudgetAdjustment],
  (approvedVoters, totalVoters) => {
    if (parseInt(totalVoters) === 0) {
      return 0;
    }
    return (approvedVoters / totalVoters) * 100;
  },
);

const getProposalByAddress = state => state.proposals.proposalByAddress;

export const getNewProgressReportInfo = createSelector(
  [getProposalByAddress],
  proposalByAddress => {
    const canCreateNewProgressReportCount = proposalByAddress.filter(
      proposal => proposal.newProgressReport,
    ).length;
    const totalProgressReportCount = proposalByAddress.length;
    return {
      canCreateNewProgressReportCount,
      totalProgressReportCount,
      canCreateNewProgressReport: canCreateNewProgressReportCount > 0,
    };
  },
);

const getMyProposals = state => state.proposals.myProposalList;

export const getProposalPendingProgressReport = createSelector(
  [getProposalByAddress, getMyProposals],
  (proposalByAddress, myProposals) => {
    const pendingProposalIPFSList = [];

    const activePausedProposals = myProposals.filter(proposal => {
      const status = proposalStatusMapping.find(
        mapping => mapping.status === proposal._status,
      ).name;
      return status === 'Active' || status === 'Paused';
    });
    const proposalPendingProgressReport = activePausedProposals
      .filter(proposal => {
        const flag =
          proposalByAddress.find(item => item.ipfsKey === proposal.ipfsKey)
            ?.newProgressReport === true;

        if (flag) {
          pendingProposalIPFSList.push(proposal.ipfsKey);
        }

        return flag;
      })
      .map(proposal => ({
        ...proposal,
        pendingPR: true,
      }));

    const proposalNotPendingProgressReport = myProposals
      .filter(proposal => !pendingProposalIPFSList.includes(proposal.ipfsKey))
      .map(proposal => ({
        ...proposal,
        pendingPR: false,
      }));
    return {
      proposalPendingProgressReport: [
        ...proposalPendingProgressReport,
        ...proposalNotPendingProgressReport,
      ],
      proposalNotPendingProgressReport,
    };
  },
);
