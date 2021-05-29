const IconService = require('icon-sdk-js');
const BigNumber = require('bignumber.js');
const { PERIOD_MAPPINGS } = require('./constants')
const { sleep } = require('./utils');

// Environment variable declaration
const provider = process.env.BLOCKCHAIN_PROVIDER;
const score_address = process.env.SCORE_ADDRESS;
const priv_key = process.env.PRIVATE_KEY;
const user_address = process.env.USER_ADDRESS;

// ICON initialize
const {
	IconBuilder,
	HttpProvider,
	IconWallet,
	SignedTransaction,
	IconConverter,
} = IconService;
const { CallTransactionBuilder, CallBuilder } = IconBuilder;
const httpProvider = new HttpProvider(provider);
const iconService = new IconService(httpProvider);

// TODO: uncomment
// let wallet;
const wallet = IconWallet.loadPrivateKey(priv_key);

const timeout = instance => {
	const seconds = instance === 1 ? 2000 : 1000;
	return new Promise(resolve => setTimeout(resolve, seconds));
};

const getResult = async (txHash, instance = 1) => {
	try {
		await timeout(instance);
		const txResult = await iconService.getTransactionResult(txHash).execute();
		return true;
	} catch (err) {
		if (instance === 5) {
			console.log(err);
			return false;
		}
		instance++;
		console.log(`Retrying...., Atempt ${instance - 1}`);
		await getResult(txHash, instance);
	}
};

function icon_call_builder(methodName, params = {}) {
	const callBuilder = new CallBuilder();
	const call = callBuilder
		.to(score_address)
		.method(methodName)
		.params(params)
		.build();
	return call;
}

function icon_transaction_call_builder(methodName, params = {}) {
	const callTransactionBuilder = new CallTransactionBuilder();
	const call = callTransactionBuilder
		.from(wallet.getAddress())
		.to(score_address)
		.stepLimit(IconConverter.toBigNumber('20000000'))
		.nid(IconConverter.toBigNumber(process.env.NID))
		.nonce(IconConverter.toBigNumber('1'))
		.version(IconConverter.toBigNumber('3'))
		.timestamp((new Date()).getTime() * 1000)
		.method(methodName)
		.params(params)
		.build();
	return call;
}


async function recursive_score_call(func, params = {}, data = []) {

	if (Object.keys(params).length !== 0) {
		if (!params._start_index) params._start_index = 0;
		if (!params._end_index) params._end_index = '20';
	}

	const results = await iconService.call(icon_call_builder(func, params)).execute();

	if (Array.isArray(results)) return results;

	data = data.concat(results.data);

	if (parseInt(results.count, 'hex') > data.length) {
		const interval = parseInt(params._end_index) - parseInt(params._start_index);
		params._start_index = (parseInt(params._start_index) + interval).toFixed(0);
		params._end_index = (parseInt(params._end_index) + interval).toFixed(0);
		return await recursive_score_call(func, params, data)
	} else {
		return data;
	}
}

async function period_check() {
	try {
		console.log('RPC Call for Period');
		const period_status = await iconService.call(icon_call_builder('get_period_status')).execute();

		return period_status;
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
}

async function get_preps() {
	try {
		console.log('RPC call for Preps');

		const preps = await iconService.call(icon_call_builder('get_PReps')).execute();

		console.log('=========Preps=============');
		console.log(preps);
		return preps;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
}

async function update_period() {
	try {

		const updatePeriodTransaction = await icon_transaction_call_builder('update_period');

		console.log(JSON.stringify(updatePeriodTransaction), JSON.stringify(wallet));

		const signedTransaction = new SignedTransaction(updatePeriodTransaction, wallet);
		const txHash = await iconService.sendTransaction(signedTransaction).execute();
		console.log('Transaction hash' + txHash);

		await getResult(txHash);
	} catch (error) {
		console.error(error);
		throw new Error(error);
	}
}

async function recursivelyUpdatePeriod(retry = 0) {
	try {
		present_period = await period_check();
		if(present_period['period_name'] == PERIOD_MAPPINGS.TRANSITION_PERIOD) {
			console.log('In transition period, should change to application period in 20 secs');
			await update_period();
			await sleep(2000);	// sleep for 2 secs
			// todo: move to recursive func, max 10 calls
			if(retry < 8) {
				await recursivelyUpdatePeriod(++retry);
			} else {
				throw new Error('Retry limit reached. Error transitioning from transition period to application period');
			}
		}
	} catch(e) {
		console.log("Error updating period recursively", JSON.stringify(e));
		await recursivelyUpdatePeriod(++retry);
	}
}

async function get_active_proposals(address) {
	console.log('RPC Call for Active Proposals');
	const active_proposals = await recursive_score_call('get_active_proposals', { _wallet_address: address });
	// const active_proposals = await iconService.call(icon_call_builder('get_active_proposals', { _wallet_address: address })).execute();

	// console.log('get_active_proposals: ' + JSON.stringify(active_proposals));
	return active_proposals;
}

function get_remaining_funds() {
	console.log('RPC call for remaining funds');
	return iconService.call(icon_call_builder('get_remaining_fund')).execute();
}

async function get_project_amounts_by_status(status) {
	console.log('RPC call for project amounts');
	const res = await iconService.call(icon_call_builder('get_project_amounts')).execute();
	// console.log(JSON.stringify(res));
	return res[status];
}

async function get_progress_reports_by_status(status = '_approved', fromLastPeriodOnly=false) {
	console.log(`RPC Call for ${status} Progress Reports`);
	const progressReports = await recursive_score_call('get_progress_reports', { _status: status });
	// const accepted_active_proposals = await iconService.call(icon_call_builder('get_progress_reports', { status: '_approved' }));

	if(fromLastPeriodOnly) {
		return progressReports.filter(progressReport => {
			const timeDiff = new BigNumber(progressReport.timestamp).div(1000).minus(Date.now());	// micro to milli
			return Math.abs(timeDiff.div(1000*24*60*60).toNumber()) < 1;
		})
	}

	// console.log('get_progress_reports_by_status: ' + JSON.stringify(accepted_active_proposals));
	return progressReports;
}

async function get_proposal_and_progress_report_count() {
	console.log('RPC Call for Proposal and Progress Report Count');
	const accepted_active_proposals = await iconService.call(icon_call_builder('get_proposals_keys_by_status', { status: '_pending' })).execute();

	const accepted_active_progress_report = await iconService.call(icon_call_builder('get_progress_reports', { status: '_waiting' })).execute();

	return {
		proposals_count: accepted_active_proposals.length,
		progress_report_count: accepted_active_progress_report.count
	};
}

async function get_remaining_projects(address) {
	console.log('RPC Call for Remaining Project');
	const project_list = await recursive_score_call('get_remaining_project', { _project_type: 'proposal', _wallet_address: address });
	// const project_list = await iconService.call(icon_call_builder('get_remaining_project', { _wallet_address: address })).execute();

	// console.log('get_remaining_projects: ' + JSON.stringify(project_list));
	return project_list;
}

async function get_proposals_details(address) {
	console.log('RPC Call for Proposal Details');
	const proposal_details = await recursive_score_call('get_proposal_detail_by_wallet', { _wallet_address: address });

	// console.log('get_proposals_details: ' + JSON.stringify(proposal_details));
	return proposal_details;
}

async function getProposalDetailsByStatus(status, fromLastPeriodOnly=false) {
	console.log('Recursive RPC Call for method get_proposal_details for status ', status);

	// let proposalDetails = [];
	const proposalDetails = await recursive_score_call(
		'get_proposal_details', 
		{
			'_status': status,
			'_wallet_address': user_address
		}
	);
	// console.log('getProposalDetailsByStatus: ' + JSON.stringify(proposalDetails));
	
	if(fromLastPeriodOnly) {
		// retrun data from last period only (timestamp < 24hrs)
		return proposalDetails.filter(proposal => {
			const timeDiff = new BigNumber(proposal.timestamp).div(1000).minus(Date.now());	// micro to milli
			// TODO: remove console msgs
			console.log(proposal.project_title);
			console.log(Math.abs(timeDiff.div(1000*24*60*60).toNumber()));
			return Math.abs(timeDiff.div(1000*24*60*60).toNumber()) < 1;
		})
	}

	return proposalDetails;
}

async function progress_report_reminder_before_one_day(user_details_list) {
	let address_notification_list = [];
	try {
		for (const user_detail of user_details_list) {
			const user_active_proposals = await get_active_proposals(user_detail.address);

			if (user_active_proposals.length > 0) {
				const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
					return parseInt(proposal.new_progress_report) == 1;
				})

				for (const new_proposal of new_user_active_proposals) {
					user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"address\": \"${user_detail.address}\"
                }`
					address_notification_list.push(user_detail);
				}
			} else {
				console.log('function: get_active_proposals in progress_report_reminder_before_one_day is empty');
			}
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function progress_report_reminder_before_one_week(user_details_list) {
	let address_notification_list = [];
	try {
		for (const user_detail of user_details_list) {
			const user_active_proposals = await get_active_proposals(user_detail.address);

			if (user_active_proposals.length > 0) {
				const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
					return parseInt(proposal.new_progress_report) == 1;
				})

				for (const new_proposal of new_user_active_proposals) {
					user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"address\": \"${user_detail.address}\"
                }`
					address_notification_list.push(user_detail);
				}
			} else {
				console.log('function: get_active_proposals in progress_report_reminder_before_one_week is empty');
			}
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function voting_reminder_before_one_day(user_details_list, type) {
	let address_notification_list = [];
	try {
		type = (type === 'Proposal') ? 'Proposal' : 'Progress Report';

		for (const user_detail of user_details_list) {
			const user_active_proposals = await get_remaining_projects(user_detail.address);

			if (user_active_proposals.length > 0) {
				const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
					return proposal._project_type == type;
				})

				if (new_user_active_proposals.length != 0 && address_notification_list.indexOf(user_detail) === -1) {
					user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"address\": \"${user_detail.address}\"
                }`
					address_notification_list.push(user_detail);
				}
			} else {
				console.log('function: get_remaining_projects in voting_reminder_before_one_day is empty');
			}
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function voting_reminder_before_one_week(user_details_list, type) {
	let address_notification_list = [];
	try {
		type = (type === 'Proposal') ? 'Proposal' : 'Progress Report';

		for (const user_detail of user_details_list) {
			const user_active_proposals = await get_remaining_projects(user_detail.address);

			if (user_active_proposals.length > 0) {
				const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
					return proposal._project_type == type;
				})

				if (new_user_active_proposals.length != 0 && address_notification_list.indexOf(user_detail) === -1) {
					user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"address\": \"${user_detail.address}\"
                }`
					address_notification_list.push(user_detail);
				}
			} else {
				console.log('function: get_remaining_projects in voting_reminder_before_one_week is empty');
			}
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function sponsorship_accepted_notification(user_details_list) {
	let address_notification_list = [];
	try {

		for (const user_detail of user_details_list) {
			const user_active_proposals = await get_proposals_details(user_detail.address);

			if (user_active_proposals.length > 0) {
				const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
					return proposal._status == '_pending';
				})

				for (const new_proposal of new_user_active_proposals) {
					user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"contributor_address\": \"${new_proposal.contributor_address}\"
                }`
					address_notification_list.push(user_detail);
				}
			} else {
				console.log('function: get_proposals_details in sponsorship_accepted_notification is empty');
			}
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function proposal_accepted_notification(user_details_list) {
	let address_notification_list = [];
	try {

		for (const user_detail of user_details_list) {
			const user_active_proposals = await get_proposals_details(user_detail.address);

			if (user_active_proposals.length > 0) {
				const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
					return proposal._status == '_active';
				})

				for (const new_proposal of new_user_active_proposals) {
					user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"total_budget\": \"${new_proposal.total_budget}\",
                    \"project_duration\": \"${new_proposal.project_duration}\",
                    \"address\": \"${user_detail.address}\",
                }`
					address_notification_list.push(user_detail);
				}
			} else {
				console.log('function: get_proposals_details in proposal_accepted_notification is empty');
			}
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function budget_approved_notification(user_details_list) {
	let address_notification_list = [];
	try {
		const proposals = await get_progress_reports_by_status();

		if (proposals.length > 0) {
			for (const user_detail of user_details_list) {
				const user_reports = proposals.filter(e => e.contributor_address === user_detail.address);

				for (const user_report of user_reports) {
					user_detail.replacementTemplateData = `{
                        \"firstName\": \"${user_detail.firstName}\",
                        \"progress_report_title\": \"${user_report.progress_report_title}\",
                        \"additional_budget\": \"${user_report.additional_budget}\",
                        \"address\": \"${user_detail.address}\",
                    }`
					address_notification_list.push(user_detail);
				}
			}
		} else {
			console.log('function: get_progress_reports_by_status in budget_approved_notification is empty');
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

async function budget_rejected_notification(user_details_list) {
	let address_notification_list = [];
	try {
		const proposals = await get_progress_reports_by_status('_progress_report_rejected');

		if (proposals.length > 0) {
			for (const user_detail of user_details_list) {
				const user_reports = proposals.filter(e => e.contributor_address === user_detail.address);

				for (const user_report of user_reports) {
					user_detail.replacementTemplateData = `{
                        \"firstName\": \"${user_detail.firstName}\",
                        \"progress_report_title\": \"${user_report.progress_report_title}\",
                        \"additional_budget\": \"${user_report.additional_budget}\",
                        \"address\": \"${user_detail.address}\",
                    }`
					address_notification_list.push(user_detail);
				}
			}
		} else {
			console.log('function: get_progress_reports_by_status in budget_rejected_notification is empty');
		}
	} catch (error) {
		console.error(error);
		throw new Error(error);
	} finally {
		return address_notification_list;
	}
}

module.exports = {
	budget_rejected_notification,
	budget_approved_notification,
	proposal_accepted_notification,
	sponsorship_accepted_notification,
	voting_reminder_before_one_day,
	voting_reminder_before_one_week,
	progress_report_reminder_before_one_day,
	progress_report_reminder_before_one_week,
	get_progress_reports_by_status,
	get_proposal_and_progress_report_count,
	get_active_proposals,
	get_proposals_details,
	get_remaining_projects,
	update_period,
	period_check,
	get_preps,
	get_remaining_funds,
	get_project_amounts_by_status,
	recursivelyUpdatePeriod,
	getProposalDetailsByStatus
}
