const subscriptionKey = 'botSubscriber';


const IPFS_BASE_URL = ['https://gateway.ipfs.io/ipfs/', 'https://cloudflare-ipfs.com/ipfs/'];

const eventTypesMapping = {
    voteProposal: 'voteProposal',
    sponsorApproval: 'sponsorApproval',
    submitProgressReport: 'submitProgressReport',
    voteProgressReport: 'voteProgressReport'
};

const resHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json'
};

const scoreMethods = {
    getVoteResult : 'get_vote_result',
    getProgressReportsByProposal: 'get_progress_reports_by_proposal',
    getAllPreps: 'get_PReps',
    getProposalDetailsByHash: 'get_proposal_details_by_hash'
}

const userActions = {
  subscribe: 'subscribe',
  unsubscribe: 'unsubscribe',
  getAll: 'list'
};


module.exports = {
  subscriptionKey,
  eventTypesMapping,
  resHeaders,
  scoreMethods,
  userActions,
  IPFS_BASE_URL
}