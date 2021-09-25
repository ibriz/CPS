const PERIOD_MAPPINGS = {
  APPLICATION_PERIOD: "Application Period",
  VOTING_PERIOD: "Voting Period",
  TRANSITION_PERIOD: "Transition Period",
}

const PROPOSAL_STATUS = {
  PENDING: '_pending',
  ACTIVE: '_active',
  PAUSED: '_paused',
  COMPLETED: '_completed',
  DISQUALIFIED: '_disqualified',
  REJECTED: '_rejected',
}

const PROGRESS_REPORT_STATUS = {
  WAITING: '_waiting',
  APPROVED: '_approved',
  REJECTED: '_progress_report_rejected',
}

const EVENT_TYPES = {
  PROPOSAL_STATS: 'proposalStats',
  PROGRESS_REPORT_STATS: 'prStats',
  VOTING_PERIOD_STATS: 'votingPeriodStats',
  APPLICATION_PERIOD_STATS: 'applicationPeriodStats',
}

const IPFS_BASE_URL = ['https://gateway.ipfs.io/ipfs/', 'https://cloudflare-ipfs.com/ipfs/', 
'https://ipfs.trusti.id/ipfs/', 'https://ipfs.eth.aragon.network/ipfs/'];

const SUBSCRIPTION_KEY = 'botSubscriber';

const BRIDGE_EVENT_TYPES = {
  reminders: 'reminders',
  periodChangeNotifications: 'periodChangeNotifications'
}

module.exports = {
  PERIOD_MAPPINGS,
  PROPOSAL_STATUS,
  PROGRESS_REPORT_STATUS,
  EVENT_TYPES,
  IPFS_BASE_URL,
  SUBSCRIPTION_KEY,
  BRIDGE_EVENT_TYPES
}