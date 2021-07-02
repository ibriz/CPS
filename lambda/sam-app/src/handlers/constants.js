const subscriptionKey = 'botSubscriber';


const ipfsBaseUrl = 'https://gateway.ipfs.io/ipfs/';

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
  ipfsBaseUrl,
  eventTypesMapping,
  resHeaders,
  scoreMethods,
  userActions,
}