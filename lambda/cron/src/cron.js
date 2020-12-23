const mail = require('./mail');
const redis = require('./redis');
const score = require('./score');

const DAY = 24 * 60 * 60;

async function execute() {
    let actions = [];
    try {

        //code block to trigger the period change
        let period_triggered = false;

        let present_period = await score.period_check();
        console.log("Period from Blockchain" + JSON.stringify(present_period));

        if (parseInt(present_period.remaining_time, 'hex') === 0) {
            console.log("Period updated");
            await score.update_period(present_period);
            period_triggered = true;
            present_period = await score.period_check();
            console.log("Changed period: " + period_triggered);
        }

        const preps = await score.get_preps();

        const preps_key = preps.map(prep => 'users:address:' + prep.address);

        console.log(preps_key);

        //code block for email notifications
        const registered_users_key = await redis.get_registered_users_keys();

        const user_details_list = await redis.populate_users_details(registered_users_key);

        const preps_list = await redis.populate_users_details(preps_key);
        console.log("Notification enabled user details" + JSON.stringify(user_details_list));

        if (period_triggered) {
            const period_changed = async (preps_list) => {
                console.log("preps_list" + preps_list)
                console.log("Sending emails to " + preps_list.length + " preps");
                await mail.send_bulk_email('period-change',
                                            preps_list,
                                            'Start of new period | ICON CPS',
                                            { 
                                                period: present_period._period_name 
                                            });
            }

            actions.push(period_changed);
        }

        console.log(present_period);

        if (present_period.period_name === 'Application Period') {
            console.log('1');

            if (parseInt(present_period.remaining_time) <= DAY) {
                const progress_report_reminder_before_one_day_async = score.progress_report_reminder_before_one_day(user_details_list).then(async (contributor_notification_list) => {
                    console.log("contributor_notification_list" + contributor_notification_list)
                    console.log("Sending emails to " + contributor_notification_list.length + " contributors");
                    await mail.send_bulk_email('contributor-reminder',
                                                contributor_notification_list,
                                                'One day remaining for progress report | ICON CPS',
                                                `{ \"time\": \"24 hours\", \"type\": \"Progress Report\" }`);
                })

                actions.push(progress_report_reminder_before_one_day_async);
            } else if (parseInt(period.remaining_time) <= 7 * DAY && parseInt(period.remaining_time) >= 6 * DAY) {
                const progress_report_reminder_before_one_week = score.progress_report_reminder_before_one_week(user_details_list).then(async (contributor_notification_list) => {
                    console.log("contributor_notification_list" + contributor_notification_list)
                    console.log("Sending emails to " + contributor_notification_list.length + " contributors");
                    await mail.send_bulk_email('contributor-reminder',
                                                contributor_notification_list,
                                                'One week remaining for progress report | ICON CPS',
                                                `{ \"time\": \"one week\", \"type\": \"Progress Report\" }`);
                })

                actions.push(progress_report_reminder_before_one_week);
            } else {
                console.log('No reminders sent to users');
            }

            const sponsorship_accepted_notification_async = score.sponsorship_accepted_notification(user_details_list).then(async (contributor_notification_list) => {
                console.log("contributor_notification_list" + contributor_notification_list)
                console.log("Sending emails to " + contributor_notification_list.length + " contributors");
                await mail.send_bulk_email('sponsorship-accepted',
                                            contributor_notification_list,
                                            'Sponsorship Request Accepted | ICON CPS');
            })

            actions.push(sponsorship_accepted_notification_async);

            if (period_triggered) {
                const proposal_accepted_notification_async = score.proposal_accepted_notification(user_details_list).then(async (contributor_notification_list) => {
                    console.log("contributor_notification_list" + contributor_notification_list)
                    console.log("Sending emails to " + contributor_notification_list.length + " contributors");
                    await mail.send_bulk_email('proposal-accepted',
                                                contributor_notification_list,
                                                'One week remaining for voting | ICON CPS',
                                                `{ \"type\": \"Proposal\" }`);
                })

                const budget_approved_notification_async = score.budget_approved_notification(user_details_list).then(async (contributor_notification_list) => {
                    console.log("contributor_notification_list" + contributor_notification_list)
                    console.log("Sending emails to" + contributor_notification_list + "contributors");
                    await mail.send_bulk_email('budget-change',
                                                contributor_notification_list,
                                                'Budget Approval | ICON CPS',
                                                `{ \"status\": \"approved\" }`);
                })

                const budget_rejected_notification_async = score.budget_rejected_notification(user_details_list).then(async (contributor_notification_list) => {
                    console.log("contributor_notification_list" + contributor_notification_list)
                    console.log("Sending emails to" + contributor_notification_list + "contributors");
                    await mail.send_bulk_email('budget-change',
                                                contributor_notification_list,
                                                'Budget Rejected | ICON CPS',
                                                `{ \"status\": \"rejected\" }`);
                })

                actions.push(proposal_accepted_notification_async, budget_approved_notification_async, budget_rejected_notification_async);
            }
        } else if (present_period.period_name === 'Voting Period') {
            console.log('2');
            if (parseInt(present_period.remaining_time) <= DAY) {
                const voting_reminder_before_one_day_proposal_async = score.voting_reminder_before_one_day(preps_list, 'Proposal').then(async (preps_notification_list) => {
                    console.log("preps_notification_list" + preps_notification_list)
                    console.log("Sending emails to " + preps_notification_list.length + " preps");
                    await mail.send_bulk_email('prep-day-reminder',
                                                preps_notification_list,
                                                'One day remaining for voting | ICON CPS',
                                                `{ \"icx\": \"${process.env.ICX_PENALTY}\" }`);
                })

                const voting_reminder_before_one_day_progress_report_async = score.voting_reminder_before_one_day(preps_list, 'Progress Report').then(async (preps_notification_list) => {
                    console.log("preps_notification_list" + preps_notification_list)
                    console.log("Sending emails to " + preps_notification_list.length + " preps");
                    await mail.send_bulk_email('prep-day-reminder',
                                                preps_notification_list,
                                                'One day remaining for voting | ICON CPS',
                                                `{ \"icx\": \"${process.env.ICX_PENALTY}\" }`);
                })

                actions.push(voting_reminder_before_one_day_proposal_async, voting_reminder_before_one_day_progress_report_async);
            } else if (parseInt(period.remaining_time) <= 7 * DAY && parseInt(period.remaining_time) >= 6 * DAY) {
                const progress_report_reminder_before_one_week_proposal_async = score.voting_reminder_before_one_week(preps_list, 'Proposal').then(async (preps_notification_list) => {
                    console.log("preps_notification_list" + preps_notification_list)
                    console.log("Sending emails to " + preps_notification_list.length + " preps");
                    await mail.send_bulk_email('prep-week-reminder', 
                                                preps_notification_list,
                                                'One week remaining for voting | ICON CPS');
                })

                const progress_report_reminder_before_one_week_progress_report_async = score.voting_reminder_before_one_week(preps_list, 'Progress Report').then(async (preps_notification_list) => {
                    console.log("preps_notification_list" + preps_notification_list)
                    console.log("Sending emails to " + preps_notification_list.length + " preps");
                    await mail.send_bulk_email('prep-week-reminder',
                                                preps_notification_list,
                                                'One week remaining for voting | ICON CPS');
                })

                actions.push(progress_report_reminder_before_one_week_proposal_async, progress_report_reminder_before_one_week_progress_report_async);
            } else {
                console.log('No reminders sent to users');
            }
        }
    } catch (error) {
        throw new Error(error);
    } finally {
        return actions;
    }
}

module.exports = { execute };