const BigNumber = require('bignumber.js');
const mail = require('./mail');
const redis = require('./redis');
const score = require('./score');
const { PERIOD_MAPPINGS } = require('./constants');
const { sleep } = require('./utils');
const { default: axios } = require('axios');


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
			// if current period is "Voting Period" -> updatePeriod moves it to transition period
			// wait for 20 secs, then again trigger the updatePeriod if the current period is transition period
			// then verify that the period is now application period
			console.log('Updating period...');

			await score.updatePeriod();
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

			// Trigger bot-lambda to send bot notifications
			const periodEndingDate = new Date();
  		periodEndingDate.setDate(periodEndingDate.getDate() + 15);

			const notifyBotOnPeriodChangeAsync = axios.post(
				process.env['BOT_ENDPOINT_PERIOD_CHANGE'], 
				{
					periodEndingDate: periodEndingDate.getTime(),
					presentPeriod: present_period['period_name']
				},
				{
					timeout: 10000,
					headers: {
						accessToken: process.env['BOT_ACCESS_KEY']
					}
				}
			)
				.then((res) => {
					console.log(res.data);
					console.log('SUCCESSFULLY NOTIFIED BOT ABOUT PERIOD CHANGE');
				})
				.catch(e => {
					console.log("ERROR WHILE NOTIFIYING BOT ABOUT PERIOD CHANGE");
					console.error(e);
				});

			actions.push(notifyBotOnPeriodChangeAsync);

		}


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

module.exports = { execute };