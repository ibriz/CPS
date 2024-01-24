const BigNumber = require('bignumber.js');
const { contractMethodCallService } = require('..//helpers');

const CPS_SCORE = process.env['CPS_SCORE'];

function getRemainingFund() {
  console.log('RPC call for remaining funds');
  return contractMethodCallService(CPS_SCORE, 'get_remaining_fund');
}

async function get_project_amounts_by_status(status) {
  console.log('RPC call for project amounts');
  const res = await contractMethodCallService(CPS_SCORE, 'getProjectAmounts');
  return res[status];
}

async function recursive_score_call(func, params = {}, data = []) {
  if (Object.keys(params).length !== 0) {
    if (!params._start_index) params._start_index = 0;
    if (!params._end_index) params._end_index = '20';
  }

  const results = await contractMethodCallService(CPS_SCORE, func, params);

  if (Array.isArray(results)) return results;

  data = data.concat(results.data);

  if (parseInt(results.count, 'hex') > data.length) {
    const interval =
      parseInt(params._end_index) - parseInt(params._start_index);
    params._start_index = (parseInt(params._start_index) + interval).toFixed(0);
    params._end_index = (parseInt(params._end_index) + interval).toFixed(0);
    return await recursive_score_call(func, params, data);
  } else {
    return data;
  }
}

async function getProposalDetailsByStatus(status, fromLastPeriodOnly = false) {
  console.log(
    'Recursive RPC Call for method get_proposal_details for status ',
    status,
  );

  const proposalDetails = await recursive_score_call('getProposalDetails', {
    _status: status,
    _wallet_address: process.env['USER_ADDRESS'],
  });

  if (fromLastPeriodOnly) {
    // retrun data from last period only (timestamp < 24hrs)
    return proposalDetails.filter(proposal => {
      const timeDiff = new BigNumber(proposal.timestamp)
        .div(1000)
        .minus(Date.now()); // micro to milli
      return Math.abs(timeDiff.div(1000 * 24 * 60 * 60).toNumber()) < 1;
    });
  }

  return proposalDetails;
}

async function get_progress_reports_by_status(
  status = '_approved',
  fromLastPeriodOnly = false,
) {
  console.log(`RPC Call for ${status} Progress Reports`);
  const progressReports = await recursive_score_call('getProgressReports', {
    _status: status,
  });

  if (fromLastPeriodOnly) {
    return progressReports.filter(progressReport => {
      const timeDiff = new BigNumber(progressReport.timestamp)
        .div(1000)
        .minus(Date.now()); // micro to milli
      return Math.abs(timeDiff.div(1000 * 24 * 60 * 60).toNumber()) < 1;
    });
  }

  return progressReports;
}

module.exports = {
  get_progress_reports_by_status,
  getProposalDetailsByStatus,
  getRemainingFund,
  get_project_amounts_by_status,
};
