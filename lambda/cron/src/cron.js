const BigNumber = require('bignumber.js');
const mail = require('./mail');
const redis = require('./redis');
const score = require('./score');
const { PERIOD_MAPPINGS, PROPOSAL_STATUS, PROGRESS_REPORT_STATUS, EVENT_TYPES } = require('./constants');
const { sleep, triggerWebhook, fetchFromIpfs } = require('./utils');


async function formatPRsResponse(allPRs) {
	const response = {
		passedProgressReports: [],
		rejectedProgressReports: [],
	};

	for(let progressReport of allPRs) {
		let proposalDetails;
		try {
				proposalDetails = await fetchFromIpfs(progressReport.ipfs_hash);
		} catch (err) {
				console.error("ERROR FETCHING PROGRESS REPORT DATA" + JSON.stringify(err));
				throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
		}

		const { projectName, projectDuration, totalBudget, sponserPrepName, teamName } = proposalDetails;

		const amtReleased = new BigNumber(totalBudget).div(projectDuration);

		const progressReportRes = {
			progressReportName: progressReport.progress_report_title,
			projectName,
			projectDuration,
			totalBudget,
			sponsorName: sponserPrepName,
			teamName,
			proposalIpfsHash: progressReport.ipfs_hash,
			prIpfsHash: progressReport.report_hash,
		}

		switch(progressReport.status) {
			case PROGRESS_REPORT_STATUS.REJECTED: {
				response.rejectedProgressReports.push(progressReportRes);
				break;
			}

			case PROGRESS_REPORT_STATUS.APPROVED: {
				const passedPRDetails = {
					...progressReportRes,
					amtReleasedToApplicant: amtReleased.toFixed(0),
					amtReleasedToSponsor: amtReleased.times(0.02).toFixed(0),
				};
				response.passedProgressReports.push(passedPRDetails);
				break;
			}

			default: {
				break;
			}
		}
	}

	return response;
}


async function formatProposalDetailsResponse(allProposals) {
	
	// ==============================BUILD RESPONSE FOR PROPOSALS DETAILS==============================
	const response = {
		approvedProposals: [],
		rejectedProposals: [],
		pausedProposals: [],
		disqualifiedProposals: [],
		completedProposals: [],
	}

	for(let proposal of allProposals) {
		// fetch teamName and sponsorName
		
		let proposalDetails;
		try {
				proposalDetails = await fetchFromIpfs(proposal.ipfs_hash);
		} catch (err) {
				console.error("ERROR FETCHING PROPOSAL DATA" + JSON.stringify(err));
				throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
		}

		const {teamName, sponserPrepName } = proposalDetails;

		const proposalRes = {
			proposalName: proposal.project_title,
			totalBudget: proposal.total_budget,
			teamName: teamName,
			sponsorAddress: proposal.sponsor_address,
			sponsorName: sponserPrepName,
			sponsorVoteReason: proposal.sponsor_vote_reason,
			proposalIpfsHash: proposal.ipfs_hash,
		}

		switch(proposal.status) {
			case PROPOSAL_STATUS.ACTIVE: {
				const approvedProposalDetails = {
					...proposalRes,
					approvingVoters: new BigNumber(proposal.approve_voters).toFixed(0),
					approvingVotersPercentage: new BigNumber(proposal.total_voters).toNumber() > 0 ?
							new BigNumber(proposal.approve_voters).dividedBy(proposal.total_voters).toFixed(2, 1)
							:
							'0',
					approvedVotes: new BigNumber(proposal.approved_votes).toFixed(0),
					approvedVotesPercentage: new BigNumber(proposal.total_votes) > 0 ?
							new BigNumber(proposal.approved_votes).dividedBy(proposal.total_votes).toFixed(2,1)
							:
							'0',
				};
				response.approvedProposals.push(approvedProposalDetails);
				break;
			}
			
			case PROPOSAL_STATUS.REJECTED: {
				const rejectedProposalDetails = {
					...proposalRes,
					rejectingVoters: new BigNumber(proposal.reject_voters).toFixed(0),
					rejectingVotersPercentage: new BigNumber(proposal.total_voters).toNumber() > 0 ?
							new BigNumber(proposal.reject_voters).dividedBy(proposal.total_voters).toFixed(2, 1)
							:
							'0',
					rejectedVotes: new BigNumber(proposal.rejected_votes).toFixed(0),
					rejectedVotesPercentage: new BigNumber(proposal.total_votes) > 0 ?
							new BigNumber(proposal.rejected_votes).dividedBy(proposal.total_votes).toFixed(2,1)
							:
							'0',
					abstainingVoters: new BigNumber(proposal.total_voters)
						.minus(proposal.approve_voters)
						.minus(proposal.reject_voters)
						.toFixed(0),
					abstainedVotes: new BigNumber(proposal.total_votes)
						.minus(proposal.approved_votes)
						.minus(proposal.rejected_votes)
						.toFixed(0),
				};
				response.rejectedProposals.push(rejectedProposalDetails);
				break;
			}

			case PROPOSAL_STATUS.PAUSED: {
				response.pausedProposals.push(proposalRes);
				break;
			}
			
			case PROPOSAL_STATUS.DISQUALIFIED: {
				response.disqualifiedProposals.push(proposalRes);
				break;
			}

			case PROPOSAL_STATUS.COMPLETED: {
				response.completedProposals.push(proposalRes);
				break;
			}
		}
	}

	return response;

}

async function period_changed(preps_list, period) {
	if (preps_list !== undefined && preps_list.length > 0) {

		const count = await score.get_proposal_and_progress_report_count();

		console.log('preps_list' + preps_list)
		console.log('Sending emails to ' + preps_list.length + ' preps');

		const period_changed_preps_list = preps_list.map(e => {
			return {
				email: e.email,
				replacementTemplateData: `{\"address\":\"${e.address}\",
                                        \"firstName\":\"${e.firstName}\"}`
			}
		});

		const templateName = period == PERIOD_MAPPINGS.APPLICATION_PERIOD ? 
			'period-change-to-application' :
			'period-change-to-voting';

		await mail.send_bulk_email(templateName,
			period_changed_preps_list,
			'Start of new period | ICON CPS',
			`,\"period\": \"${period}\",
			\"proposal_no\":\"${count.proposals_count}\",
			\"progress_report_no\":\"${count.progress_report_count}\"`);
	} else {
		console.log('No user to send notification: period_changed')
	}
}


async function execute() {
	let actions = [];
	try {

		//code block to trigger the period change
		let period_triggered = false;

		let present_period = await score.period_check();
		// transition is as : voting -> transition -> application
		console.log('Period from Blockchain' + JSON.stringify(present_period));
		
		// TODO: Remove this
		console.log(present_period.remaining_time);
		
		if (parseInt(present_period.remaining_time, 'hex') == 0) {
			// if current period is "Voting Period" -> update_period moves it to transition period
			// wait for 20 secs, then again trigger the update_period if the current period is transition period
			// then verify that the period is now application period
			console.log('Updating period...');

			await score.update_period();
			await sleep(2000);	// sleep for 2 secs
			present_period = await score.period_check();
			console.log('Changed period to: ' + present_period['period_name']);

			if(present_period['period_name'] == PERIOD_MAPPINGS.TRANSITION_PERIOD) {
				await score.recursivelyUpdatePeriod();
				present_period = await score.period_check();
				console.log('Changed period to: ' + present_period['period_name']);
			}

			if(present_period['period_name'] == present_period['previous_period_name']) {
				console.log('Period could not be changed...');
				return;
			}

			period_triggered = true;

			const periodEndingDate = new Date();
			periodEndingDate.setDate(periodEndingDate.getDate() + 15);

			// ========================================CPS BOT TRIGGERS=========================================

			if(present_period['period_name'] == PERIOD_MAPPINGS.APPLICATION_PERIOD) {
				console.log("=================BOT NOTIFICATIONS FOR APPLICATION PERIOD==================");
				const votingPeriodStatsForBot = new Promise(async (resolve, reject) => {
					try {
						// Send out last voting period's stats
						const remainingFunds = await score.get_remaining_funds();
						const activeProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.ACTIVE);
						const votingPeriodStats = {
							remainingFunds: new BigNumber(remainingFunds).div(Math.pow(10,18)).toFixed(2),
							periodEndsOn: periodEndingDate.getTime().toString(),
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
			if(present_period['period_name'] == PERIOD_MAPPINGS.VOTING_PERIOD) {
				console.log("=================BOT NOTIFICATIONS FOR VOTING PERIOD==================");
				const applicationPeriodStatsForBot = new Promise(async (resolve, reject) => {
					try {
						const pendingProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.PENDING);
						const waitingProgressReports = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.WAITING);
						const applicationPeriodStats = {
							votingProposalsCount: new BigNumber(pendingProjectAmt['_count']).toFixed(),
							votingProposalsBudget: new BigNumber(pendingProjectAmt['_total_amount']).div(Math.pow(10,18)).toFixed(),
							periodEndsOn: periodEndingDate.getTime().toString(),
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
		}
		// ===================================================================================================


		if (period_triggered) {
			const preps = await score.get_preps();
			const preps_key = preps.map(prep => 'users:address:' + prep.address);
			console.log(preps_key);

			//code block for email notifications
			const registered_users_key = await redis.get_registered_users_keys();
			const user_details_list = await redis.populate_users_details(registered_users_key);

			const preps_list = await redis.populate_users_details(preps_key);
			console.log('Notification enabled user details ' + JSON.stringify(user_details_list));
			console.log('Notification enabled preps details ' + JSON.stringify(preps_list));

			// Send out period changed email notifications
			console.log("Period is changed so now sending bulk emails");
			await period_changed(preps_list, present_period.period_name);

			console.log(present_period);

			if (present_period.period_name === PERIOD_MAPPINGS.APPLICATION_PERIOD && user_details_list.length > 0) {
				console.log('=====================EMAIL NOTIFICATIONS FOR APPLICATION PERIOD=======================');


				const proposal_accepted_notification_async = score.proposal_accepted_notification(user_details_list).then(async (contributor_notification_list) => {
					if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
						console.log('contributor_notification_list' + contributor_notification_list)
						console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
						await mail.send_bulk_email('proposal-accepted',
							contributor_notification_list,
							'Proposal Accepted | ICON CPS',
							`,\"type\": \"Proposal\"`);
					} else {
						console.log('No user to send notification: proposal_accepted_notification_async')
					}
				}).catch(e => { 
					console.log("Error on proposal_accepted_notification");
					console.error(e);
				})

				const budget_approved_notification_async = score.budget_approved_notification(user_details_list).then(async (contributor_notification_list) => {
					if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
						console.log('contributor_notification_list' + contributor_notification_list)
						console.log('Sending emails to' + contributor_notification_list + 'contributors');
						await mail.send_bulk_email('budget-change',
							contributor_notification_list,
							'Budget Approval | ICON CPS',
							`,\"status\": \"approved\"`);
					} else {
						console.log('No user to send notification: budget_approved_notification_async')
					}
				}).catch(e => { 
					console.log("Error on budget_approved_notification");
					console.error(e);
				})

				const budget_rejected_notification_async = score.budget_rejected_notification(user_details_list).then(async (contributor_notification_list) => {
					if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
						console.log('contributor_notification_list' + contributor_notification_list)
						console.log('Sending emails to' + contributor_notification_list + 'contributors');
						await mail.send_bulk_email('budget-change',
							contributor_notification_list,
							'Budget Rejected | ICON CPS',
							`,\"status\": \"rejected\"`);
					} else {
						console.log('No user to send notification: budget_rejected_notification_async')
					}
				}).catch(e => { 
					console.log("Error on budget_rejected_notification");
					console.error(e);
				})

				actions.push(proposal_accepted_notification_async, budget_approved_notification_async, budget_rejected_notification_async);
			}
		}
	} catch (error) {
		throw new Error(error);
	} finally {
		return actions;
	}
}

async function proposal_notification(proposal) {
	try {
		const preps = await score.get_preps();
		const preps_key = preps.map(prep => 'users:address:' + prep.address);
		console.log(preps_key);

		const preps_list = await redis.populate_users_details(preps_key);

		let  notification_list = [];

		for(const user of preps_list){
			user.replacementTemplateData = `{
				\"firstName\": \"${user.firstName}\",
			}`

			notification_list.push(user);
		}

		await mail.send_bulk_email('proposal-up-by-sponsor',
			notification_list,
			'Proposal is submitted on ICON CPS',
			`,\"projectName\": \"${proposal.projectName}\", \"address\": \"${proposal.address}\"`);
	} catch (err) {
		throw err;
	}
}

module.exports = { execute, proposal_notification };