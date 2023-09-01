const BigNumber = require('bignumber.js');

const { PERIOD_MAPPINGS, EVENT_TYPES, PROPOSAL_STATUS, PROGRESS_REPORT_STATUS, resHeaders } = require('../constants');
const { ClientError, authenticateSubscriber } = require('../helpers');
const score = require('./score');
const { triggerWebhook } = require('../helpers');
const { formatProposalDetailsResponse, formatPRsResponse } = require('./formatters');

// ========================================CPS BOT TRIGGERS=========================================
async function periodChangeNotifications(presentPeriod, periodEndingDate) {
  const actions = [];

  if(presentPeriod == PERIOD_MAPPINGS.APPLICATION_PERIOD) {
    console.log("=================BOT NOTIFICATIONS FOR APPLICATION PERIOD==================");
    const votingPeriodStatsForBot = new Promise(async (resolve, reject) => {
      try {
        // Send out last voting period's stats
        const remainingFunds = await score.getRemainingFund();
        const activeProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.ACTIVE);
        const votingPeriodStats = {
          remainingFunds: new BigNumber(remainingFunds).div(Math.pow(10,18)).toFixed(2),
          periodEndsOn: typeof periodEndingDate == 'number' ? periodEndingDate.toString() : periodEndingDate,	
          activeProjectsCount: new BigNumber(activeProjectAmt['_count']).toFixed(),
          activeProjectsBudget: new BigNumber(activeProjectAmt['_total_amount']).div(Math.pow(10, 18)).toFixed(2)
        };
        await triggerWebhook(EVENT_TYPES.VOTING_PERIOD_STATS, votingPeriodStats);
        console.log("Successfully notified bot about last voting period stats");
        resolve("Successfully notified bot about last voting period stats");
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });

    actions.push(votingPeriodStatsForBot);

    const proposalStatsForBot = new Promise(async (resolve, reject) => {
      try {
        // ------Send out details of different proposals by category-----
        // get proposals by status
        const allApprovedProposals = await score.getProposalDetailsByStatus(PROPOSAL_STATUS.ACTIVE);
        const approvedProposals = allApprovedProposals.filter(proposal => parseInt(proposal.percentage_completed, 16) == 0);
        const rejectedProposals = await score.getProposalDetailsByStatus(PROPOSAL_STATUS.REJECTED, true);
        const pausedProposals = await score.getProposalDetailsByStatus(PROPOSAL_STATUS.PAUSED, true);
        const disqualifiedProposals = await score.getProposalDetailsByStatus(PROPOSAL_STATUS.DISQUALIFIED, true);
        const completedProposals = await score.getProposalDetailsByStatus(PROPOSAL_STATUS.COMPLETED, true);

        const formattedProposalDetails = await formatProposalDetailsResponse(approvedProposals.concat(rejectedProposals).concat(pausedProposals).concat(disqualifiedProposals).concat(completedProposals));

        await triggerWebhook(EVENT_TYPES.PROPOSAL_STATS, formattedProposalDetails);
        console.log("Successfully notified bot about proposals status after period change to application period");
        resolve("Successfully notified bot about proposals status after period change to application period");
      } catch(e) {
        console.error(e);
        reject(e);
      }
    });

    actions.push(proposalStatsForBot);
    
    const progressReportStatsForBot = new Promise(async (resolve, reject) => {
      try {
        // Send out details of different progress reports by category

        // get progress reports by status
        const passedPRs = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.APPROVED, true);
        const rejectedPRs = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.REJECTED, true);

        const formattedPRsDetails = await formatPRsResponse(passedPRs.concat(rejectedPRs));

        await triggerWebhook(EVENT_TYPES.PROGRESS_REPORT_STATS, formattedPRsDetails);

        console.log('Successfully notified bot about progress report status after period change to application period');
        resolve('Successfully notified bot about progress report status after period change to application period');
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });

    actions.push(progressReportStatsForBot);
  }
  // Send out last application period's stats
  if(presentPeriod == PERIOD_MAPPINGS.VOTING_PERIOD) {
    console.log("=================BOT NOTIFICATIONS FOR VOTING PERIOD==================");
    const applicationPeriodStatsForBot = new Promise(async (resolve, reject) => {
      try {
        const pendingProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.PENDING);
        const waitingProgressReports = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.WAITING);
        const applicationPeriodStats = {
          votingProposalsCount: new BigNumber(pendingProjectAmt['_count']).toFixed(),
          votingProposalsBudget: new BigNumber(pendingProjectAmt['_total_amount']).div(Math.pow(10,18)).toFixed(),
          periodEndsOn: typeof periodEndingDate == 'number' ? periodEndingDate.toString() : periodEndingDate,	
          votingPRsCount: new BigNumber(waitingProgressReports.length).toFixed(),
        };
        await triggerWebhook(EVENT_TYPES.APPLICATION_PERIOD_STATS, applicationPeriodStats);
        console.log('Successfully notified bot about last application period stats');
        resolve('Successfully notified bot about last application period stats');

      } catch(e) {
        console.error(e);
        reject(e);
      }
    });

    actions.push(applicationPeriodStatsForBot);
  }

  return actions;
}
// ===================================================================================================


exports.handler = async (req) => {
  const resCode = 200;
  console.log(req);
  try {
    await authenticateSubscriber(req.headers['accessToken']);

    if (req.httpMethod === 'POST') {
      // send notifications to bot
      const body = JSON.parse(req.body);

      if(!body || !body.periodEndingDate || !body.presentPeriod) {
        throw new ClientError('periodEndingDate and presentPeriod are required');
      }

      const { periodEndingDate, presentPeriod } = body;

      if(isNaN(periodEndingDate)) {
        throw new ClientError('Invalid periodEndingDate');
      }
      if(presentPeriod !== PERIOD_MAPPINGS.APPLICATION_PERIOD && presentPeriod !== PERIOD_MAPPINGS.VOTING_PERIOD) {
        throw new ClientError('Invalid presentPeriod');
      }

      const periodChangeActions = await periodChangeNotifications(presentPeriod, periodEndingDate);
      await Promise.all(periodChangeActions);

      return {
        statusCode: resCode,
        headers: resHeaders,
        body: JSON.stringify({ message: 'Successfully sent notifications to subscribed bots' }),
      }

    } else {
      // invalid http method
      throw new ClientError('Invalid method');
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: resHeaders,
      body: JSON.stringify({
				error: err.name ? err.name : 'Exception',
				message: err.message ? err.message : 'Unknown error',
			})
    };
  }
}