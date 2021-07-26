const BigNumber = require('bignumber.js');
const mail = require('./mail');
const redis = require('./redis');
const score = require('./score');
const { PERIOD_MAPPINGS, PROPOSAL_STATUS, PROGRESS_REPORT_STATUS, EVENT_TYPES } = require('./constants');
const { sleep, triggerWebhook, fetchFromIpfs } = require('./utils');

const DAY = 24 * 60 * 60;


async function formatPRsResponse(allPRs) {
	const response = {
		passedProgressReports: [],
		rejectedProgressReports: [],
	};

	for(progressReport of allPRs) {
		let progressReportDetails;
		try {
				progressReportDetails = await fetchFromIpfs(progressReport.ipfs_hash);
		} catch (err) {
				console.error("ERROR FETCHING PROGRESS REPORT DATA" + JSON.stringify(err));
				throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
		}

		const { projectName, projectDuration, totalBudget, sponserPrepName, teamName } = progressReportDetails;

		const amtReleased = new BigNumber(totalBudget).div(projectDuration);

		const progressReportRes = {
			progressReportName: progressReport.progress_report_title,
			projectName,
			projectDuration,
			totalBudget,
			sponsorName: sponserPrepName,
			teamName,
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

	for(proposal of allProposals) {
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
		})
		await mail.send_bulk_email('period-change',
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
			
			period_triggered = true;

			const periodEndingDate = new Date();
			periodEndingDate.setDate(periodEndingDate.getDate() + 15);

			if(present_period['period_name'] == present_period['previous_period_name']) {
				console.log('Period could not be changed...');
				return;
			}

			// ========================================CPS BOT TRIGGERS=========================================

			if(present_period['period_name'] == PERIOD_MAPPINGS.APPLICATION_PERIOD) {
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

				// Send out details of different progress reports by category

				// get progress reports by status
				const passedPRs = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.APPROVED, true);
				const rejectedPRs = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.REJECTED, true);
				
				const formattedPRsDetails = await formatPRsResponse(passedPRs.concat(rejectedPRs));

				await triggerWebhook(EVENT_TYPES.PROGRESS_REPORT_STATS, formattedPRsDetails);
			}

			// Send out last application period's stats
			if(present_period['period_name'] == PERIOD_MAPPINGS.VOTING_PERIOD) {
				const pendingProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.PENDING);
				const waitingProgressReports = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.WAITING);
				const applicationPeriodStats = {
					votingProposalsCount: new BigNumber(pendingProjectAmt['_count']).toFixed(),
					votingProposalsBudget: new BigNumber(pendingProjectAmt['_total_amount']).div(Math.pow(10,18)).toFixed(),
					periodEndsOn: periodEndingDate.getTime().toString(),
					votingPRsCount: new BigNumber(waitingProgressReports.length).toFixed(),
				};
				await triggerWebhook(EVENT_TYPES.APPLICATION_PERIOD_STATS, applicationPeriodStats);
			}
		}
		// ===================================================================================================



		const preps = await score.get_preps();
		const preps_key = preps.map(prep => 'users:address:' + prep.address);
		console.log(preps_key);

		//code block for email notifications
		const registered_users_key = await redis.get_registered_users_keys();
		const user_details_list = await redis.populate_users_details(registered_users_key);

		const preps_list = await redis.populate_users_details(preps_key);
		console.log('Notification enabled user details ' + JSON.stringify(user_details_list));
		console.log('Notification enabled preps details ' + JSON.stringify(preps_list));

		if (period_triggered) await period_changed(preps_list, present_period.period_name);

		console.log(present_period);

		if (present_period.period_name === PERIOD_MAPPINGS.APPLICATION_PERIOD && user_details_list.length > 0) {
			console.log('=====================Notifications for Application Period=======================');

			// if (parseInt(present_period.remaining_time) <= DAY) {
			// 	const progress_report_reminder_before_one_day_async = score.progress_report_reminder_before_one_day(user_details_list).then(async (contributor_notification_list) => {
			// 		if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
			// 			console.log('contributor_notification_list' + contributor_notification_list)
			// 			console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
			// 			await mail.send_bulk_email('contributor-reminder',
			// 				contributor_notification_list,
			// 				'One day remaining for progress report | ICON CPS',
			// 				`,\"time\": \"24 hours\", \"type\": \"Progress Report\"`);
			// 		} else {
			// 			console.log('No user to send notification: progress_report_reminder_before_one_day_async')
			// 		}
			// 	})

			// 	actions.push(progress_report_reminder_before_one_day_async);
			// } else if (parseInt(period.remaining_time) <= 7 * DAY && parseInt(period.remaining_time) >= 6 * DAY) {
			// 	const progress_report_reminder_before_one_week = score.progress_report_reminder_before_one_week(user_details_list).then(async (contributor_notification_list) => {
			// 		if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
			// 			console.log('contributor_notification_list' + contributor_notification_list)
			// 			console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
			// 			await mail.send_bulk_email('contributor-reminder',
			// 				contributor_notification_list,
			// 				'One week remaining for progress report | ICON CPS',
			// 				`,\"time\": \"one week\", \"type\": \"Progress Report\"`);
			// 		} else {
			// 			console.log('No user to send notification: progress_report_reminder_before_one_week')
			// 		}
			// 	})

			// 	actions.push(progress_report_reminder_before_one_week);
			// } else {
			// 	console.log('No reminders sent to users');
			// }

			// const sponsorship_accepted_notification_async = score.sponsorship_accepted_notification(user_details_list).then(async (contributor_notification_list) => {
			// 	if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
			// 		console.log('contributor_notification_list' + contributor_notification_list)
			// 		console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
			// 		await mail.send_bulk_email('sponsorship-accepted',
			// 			contributor_notification_list,
			// 			'Sponsorship Request Accepted | ICON CPS');
			// 	} else {
			// 		console.log('No user to send notification: sponsorship_accepted_notification_async')
			// 	}
			// })

			// actions.push(sponsorship_accepted_notification_async);

			if (period_triggered) {
				const proposal_accepted_notification_async = score.proposal_accepted_notification(user_details_list).then(async (contributor_notification_list) => {
					if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
						console.log('contributor_notification_list' + contributor_notification_list)
						console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
						await mail.send_bulk_email('proposal-accepted',
							contributor_notification_list,
							'One week remaining for voting | ICON CPS',
							`,\"type\": \"Proposal\"`);
					} else {
						console.log('No user to send notification: proposal_accepted_notification_async')
					}
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
				})

				actions.push(proposal_accepted_notification_async, budget_approved_notification_async, budget_rejected_notification_async);
			}
		} else if (present_period.period_name === 'Voting Period' && preps_list.length > 0) {
			console.log('=====================Notifications for Voting Period=======================');
			// if (parseInt(present_period.remaining_time) <= DAY) {
			// 	const voting_reminder_before_one_day_proposal_async = score.voting_reminder_before_one_day(preps_list, 'Proposal').then(async (preps_notification_list) => {
			// 		if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
			// 			console.log('preps_notification_list' + preps_notification_list)
			// 			console.log('Sending emails to ' + preps_notification_list.length + ' preps');
			// 			await mail.send_bulk_email('prep-day-reminder',
			// 				preps_notification_list,
			// 				'One day remaining for voting | ICON CPS',
			// 				`,\"icx\": \"${process.env.ICX_PENALTY}\"`);
			// 		} else {
			// 			console.log('No user to send notification: voting_reminder_before_one_day_proposal_async')
			// 		}
			// 	})

			// 	const voting_reminder_before_one_day_progress_report_async = score.voting_reminder_before_one_day(preps_list, 'Progress Report').then(async (preps_notification_list) => {
			// 		if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
			// 			console.log('preps_notification_list' + preps_notification_list)
			// 			console.log('Sending emails to ' + preps_notification_list.length + ' preps');
			// 			await mail.send_bulk_email('prep-day-reminder',
			// 				preps_notification_list,
			// 				'One day remaining for voting | ICON CPS',
			// 				`,\"icx\": \"${process.env.ICX_PENALTY}\"`);
			// 		} else {
			// 			console.log('No user to send notification: voting_reminder_before_one_day_progress_report_async')
			// 		}
			// 	})

			// 	actions.push(voting_reminder_before_one_day_proposal_async, voting_reminder_before_one_day_progress_report_async);
			// } else if (parseInt(period.remaining_time) <= 7 * DAY && parseInt(period.remaining_time) >= 6 * DAY) {
			// 	const progress_report_reminder_before_one_week_proposal_async = score.voting_reminder_before_one_week(preps_list, 'Proposal').then(async (preps_notification_list) => {
			// 		if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
			// 			console.log('preps_notification_list' + preps_notification_list)
			// 			console.log('Sending emails to ' + preps_notification_list.length + ' preps');
			// 			await mail.send_bulk_email('prep-week-reminder',
			// 				preps_notification_list,
			// 				'One week remaining for voting | ICON CPS');
			// 		} else {
			// 			console.log('No user to send notification: progress_report_reminder_before_one_week_proposal_async')
			// 		}
			// 	})

			// 	const progress_report_reminder_before_one_week_progress_report_async = score.voting_reminder_before_one_week(preps_list, 'Progress Report').then(async (preps_notification_list) => {
			// 		if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
			// 			console.log('preps_notification_list' + preps_notification_list)
			// 			console.log('Sending emails to ' + preps_notification_list.length + ' preps');
			// 			await mail.send_bulk_email('prep-week-reminder',
			// 				preps_notification_list,
			// 				'One week remaining for voting | ICON CPS');
			// 		} else {
			// 			console.log('No user to send notification: progress_report_reminder_before_one_week_progress_report_async')
			// 		}
			// 	})

			// 	actions.push(progress_report_reminder_before_one_week_proposal_async, progress_report_reminder_before_one_week_progress_report_async);
			// } else {
			// 	console.log('No reminders sent to users');
			// 	console.log('No of notification enabled preps: ' + preps_list.length);
			// 	console.log('No of notification enabled contributors' + user_details_list.length);
			// }
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