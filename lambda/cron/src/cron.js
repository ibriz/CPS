const BigNumber = require('bignumber.js');
const mail = require('./mail');
const redis = require('./redis');
const score = require('./score');
const { PERIOD_MAPPINGS, PROPOSAL_STATUS, PROGRESS_REPORT_STATUS, EVENT_TYPES } = require('./constants');
const { sleep, triggerWebhook } = require('./utils');

const DAY = 24 * 60 * 60;

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

		if (parseInt(present_period.remaining_time, 'hex') === 0) {
			// if current period is "Voting Period" -> update_period moves it to transition period
			// wait for 20 secs, then again trigger the update_period if the current period is transition period
			// then verify that the period is now application period
			console.log('Period updated');
			await score.update_period();
			period_triggered = true;
			await sleep(2000);	// sleep for 2 secs
			present_period = await score.period_check();
			console.log('Changed period to: ' + present_period['period_name']);

			if(present_period['period_name'] == PERIOD_MAPPINGS.TRANSITION_PERIOD) {
				await score.recursivelyUpdatePeriod();
			}

			const periodEndingDate = new Date();
			periodEndingDate.setDate(periodEndingDate.getDate() + 15);

			// ========================================CPS BOT TRIGGERS=========================================

			// Send out last voting period's stats
			if(present_period['period_name'] == PERIOD_MAPPINGS.APPLICATION_PERIOD) {
				const remainingFunds = await score.get_remaining_funds();
				const activeProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.ACTIVE);
				const votingPeriodStats = {
					remainingFunds: new BigNumber(remainingFunds).div(Math.pow(10,18)).toFixed(2),
					periodEndsOn: periodEndingDate.getTime().toString(),
					projectsCount: new BigNumber(activeProjectAmt['_count']).toFixed(),
					totalProjectsBudget: new BigNumber(activeProjectAmt['_total_amount']).div(Math.pow(10, 18)).toFixed(2)
				};
				await triggerWebhook(EVENT_TYPES.VOTING_PERIOD_STATS, votingPeriodStats);
			}

			// Send out last application period's stats
			if(present_period['period_name'] == PERIOD_MAPPINGS.VOTING_PERIOD) {
				const pendingProjectAmt = await score.get_project_amounts_by_status(PROPOSAL_STATUS.PENDING);
				const waitingProgressReportCount = await score.get_progress_reports_by_status(PROGRESS_REPORT_STATUS.WAITING);
				const applicationPeriodStats = {
					votingProposalsCount: new BigNumber(pendingProjectAmt['_count']).toFixed(),
					votingProposalsBudget: new BigNumber(activeProjectAmt['_total_amount']).toFixed(),
					periodEndsOn: periodEndingDate.getTime().toString(),
					votingPRsCount: new BigNumber(waitingProgressReportCount['count']).toFixed(),
				};
				triggerWebhook(EVENT_TYPES.APPLICATION_PERIOD_STATS, applicationPeriodStats);
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

			if (parseInt(present_period.remaining_time) <= DAY) {
				const progress_report_reminder_before_one_day_async = score.progress_report_reminder_before_one_day(user_details_list).then(async (contributor_notification_list) => {
					if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
						console.log('contributor_notification_list' + contributor_notification_list)
						console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
						await mail.send_bulk_email('contributor-reminder',
							contributor_notification_list,
							'One day remaining for progress report | ICON CPS',
							`,\"time\": \"24 hours\", \"type\": \"Progress Report\"`);
					} else {
						console.log('No user to send notification: progress_report_reminder_before_one_day_async')
					}
				})

				actions.push(progress_report_reminder_before_one_day_async);
			} else if (parseInt(period.remaining_time) <= 7 * DAY && parseInt(period.remaining_time) >= 6 * DAY) {
				const progress_report_reminder_before_one_week = score.progress_report_reminder_before_one_week(user_details_list).then(async (contributor_notification_list) => {
					if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
						console.log('contributor_notification_list' + contributor_notification_list)
						console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
						await mail.send_bulk_email('contributor-reminder',
							contributor_notification_list,
							'One week remaining for progress report | ICON CPS',
							`,\"time\": \"one week\", \"type\": \"Progress Report\"`);
					} else {
						console.log('No user to send notification: progress_report_reminder_before_one_week')
					}
				})

				actions.push(progress_report_reminder_before_one_week);
			} else {
				console.log('No reminders sent to users');
			}

			const sponsorship_accepted_notification_async = score.sponsorship_accepted_notification(user_details_list).then(async (contributor_notification_list) => {
				if (contributor_notification_list !== undefined && contributor_notification_list.length > 0) {
					console.log('contributor_notification_list' + contributor_notification_list)
					console.log('Sending emails to ' + contributor_notification_list.length + ' contributors');
					await mail.send_bulk_email('sponsorship-accepted',
						contributor_notification_list,
						'Sponsorship Request Accepted | ICON CPS');
				} else {
					console.log('No user to send notification: sponsorship_accepted_notification_async')
				}
			})

			actions.push(sponsorship_accepted_notification_async);

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
			if (parseInt(present_period.remaining_time) <= DAY) {
				const voting_reminder_before_one_day_proposal_async = score.voting_reminder_before_one_day(preps_list, 'Proposal').then(async (preps_notification_list) => {
					if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
						console.log('preps_notification_list' + preps_notification_list)
						console.log('Sending emails to ' + preps_notification_list.length + ' preps');
						await mail.send_bulk_email('prep-day-reminder',
							preps_notification_list,
							'One day remaining for voting | ICON CPS',
							`,\"icx\": \"${process.env.ICX_PENALTY}\"`);
					} else {
						console.log('No user to send notification: voting_reminder_before_one_day_proposal_async')
					}
				})

				const voting_reminder_before_one_day_progress_report_async = score.voting_reminder_before_one_day(preps_list, 'Progress Report').then(async (preps_notification_list) => {
					if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
						console.log('preps_notification_list' + preps_notification_list)
						console.log('Sending emails to ' + preps_notification_list.length + ' preps');
						await mail.send_bulk_email('prep-day-reminder',
							preps_notification_list,
							'One day remaining for voting | ICON CPS',
							`,\"icx\": \"${process.env.ICX_PENALTY}\"`);
					} else {
						console.log('No user to send notification: voting_reminder_before_one_day_progress_report_async')
					}
				})

				actions.push(voting_reminder_before_one_day_proposal_async, voting_reminder_before_one_day_progress_report_async);
			} else if (parseInt(period.remaining_time) <= 7 * DAY && parseInt(period.remaining_time) >= 6 * DAY) {
				const progress_report_reminder_before_one_week_proposal_async = score.voting_reminder_before_one_week(preps_list, 'Proposal').then(async (preps_notification_list) => {
					if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
						console.log('preps_notification_list' + preps_notification_list)
						console.log('Sending emails to ' + preps_notification_list.length + ' preps');
						await mail.send_bulk_email('prep-week-reminder',
							preps_notification_list,
							'One week remaining for voting | ICON CPS');
					} else {
						console.log('No user to send notification: progress_report_reminder_before_one_week_proposal_async')
					}
				})

				const progress_report_reminder_before_one_week_progress_report_async = score.voting_reminder_before_one_week(preps_list, 'Progress Report').then(async (preps_notification_list) => {
					if (preps_notification_list !== undefined && preps_notification_list.length > 0) {
						console.log('preps_notification_list' + preps_notification_list)
						console.log('Sending emails to ' + preps_notification_list.length + ' preps');
						await mail.send_bulk_email('prep-week-reminder',
							preps_notification_list,
							'One week remaining for voting | ICON CPS');
					} else {
						console.log('No user to send notification: progress_report_reminder_before_one_week_progress_report_async')
					}
				})

				actions.push(progress_report_reminder_before_one_week_proposal_async, progress_report_reminder_before_one_week_progress_report_async);
			} else {
				console.log('No reminders sent to users');
				console.log('No of notification enabled preps: ' + preps_list.length);
				console.log('No of notification enabled contributors' + user_details_list.length);
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
	} catch (error) {
		throw new Error(error);
	}
}

module.exports = { execute, proposal_notification };