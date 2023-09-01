const subscriptionKey = 'botSubscriber';

const PERIOD_MAPPINGS = {
  APPLICATION_PERIOD: 'Application Period',
  VOTING_PERIOD: 'Voting Period',
  TRANSITION_PERIOD: 'Transition Period',
};

const EVENT_TYPES = {
  PROPOSAL_STATS: 'proposalStats',
  PROGRESS_REPORT_STATS: 'prStats',
  VOTING_PERIOD_STATS: 'votingPeriodStats',
  APPLICATION_PERIOD_STATS: 'applicationPeriodStats',
};

const PROPOSAL_STATUS = {
  PENDING: '_pending',
  ACTIVE: '_active',
  PAUSED: '_paused',
  COMPLETED: '_completed',
  DISQUALIFIED: '_disqualified',
  REJECTED: '_rejected',
};

const PROGRESS_REPORT_STATUS = {
  WAITING: '_waiting',
  APPROVED: '_approved',
  REJECTED: '_progress_report_rejected',
};

const IPFS_BASE_URL = [
  'https://gateway.ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.trusti.id/ipfs/',
  'https://ipfs.eth.aragon.network/ipfs/',
];

const eventTypesMapping = {
  voteProposal: 'voteProposal',
  sponsorApproval: 'sponsorApproval',
  submitProgressReport: 'submitProgressReport',
  voteProgressReport: 'voteProgressReport',
};

const resHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
};

const scoreMethods = {
  getVoteResult: 'getVoteResult',
  getProgressReportsByProposal: 'getProgressReportsByProposal',
  getAllPreps: 'getPReps',
  getProposalDetailsByHash: 'get_proposal_details_by_hash',
};

const userActions = {
  subscribe: 'subscribe',
  unsubscribe: 'unsubscribe',
  getAll: 'list',
};

module.exports = {
  subscriptionKey,
  eventTypesMapping,
  resHeaders,
  scoreMethods,
  userActions,
  IPFS_BASE_URL,
  PERIOD_MAPPINGS,
  EVENT_TYPES,
  PROPOSAL_STATUS,
  PROGRESS_REPORT_STATUS,
};
