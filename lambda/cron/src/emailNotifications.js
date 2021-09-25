const mail = require('./mail');
const redis = require('./redis');
const score = require('./score');
const { PERIOD_MAPPINGS } = require('./constants');


const DAY = 24 * 60 * 60;


async function sendEmailNotifications() {
  let actions = [];

  try {
    const present_period = await score.period_check();

    const preps = await score.get_preps();
    const preps_key = preps.map(prep => 'users:address:' + prep.address);
    console.log(preps_key);

    //code block for email notifications
    const registered_users_key = await redis.get_registered_users_keys();
    const user_details_list = await redis.populate_users_details(registered_users_key);

    const preps_list = await redis.populate_users_details(preps_key);
    console.log('Notification enabled user details ' + JSON.stringify(user_details_list));
    console.log('Notification enabled preps details ' + JSON.stringify(preps_list));

    if (present_period.period_name === PERIOD_MAPPINGS.APPLICATION_PERIOD && user_details_list.length > 0) {
      console.log('=====================Notifications for Application Period=======================');

      if (parseInt(present_period.remaining_time, 16) <= DAY && parseInt(present_period.remaining_time, 16) > 0) {
        console.log("LESS THAN DAY REMAINING");
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
        }).catch(e => { 
          console.log("Error on progress_report_reminder_before_one_day");
          console.error(e);
        })

        actions.push(progress_report_reminder_before_one_day_async);
      } else if (parseInt(present_period.remaining_time, 16) <= 7 * DAY && parseInt(present_period.remaining_time, 16) >= 6 * DAY) {
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
        }).catch(e => { 
          console.log("Error on progress_report_reminder_before_one_week");
          console.error(e);
        })

        actions.push(progress_report_reminder_before_one_week);
      } else {
        console.log('No reminders sent to users');
      }
    }  else if (present_period.period_name === PERIOD_MAPPINGS.VOTING_PERIOD && preps_list.length > 0) {
      console.log('=====================Notifications for Voting Period=======================');
      if (parseInt(present_period.remaining_time, 16) <= DAY) {
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
        }).catch(e => { 
        console.log("Error on voting_reminder_before_one_day_proposal");
        console.error(e);
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
        }).catch(e => { 
          console.log("Error on voting_reminder_before_one_day_progress_report");
          console.error(e);
        })

        actions.push(voting_reminder_before_one_day_proposal_async, voting_reminder_before_one_day_progress_report_async);
        
      } else if (parseInt(present_period.remaining_time, 16) <= 7 * DAY && parseInt(present_period.remaining_time, 16) >= 6 * DAY) {
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
        }).catch(e => { 
          console.log("Error on progress_report_reminder_before_one_week_proposal");
          console.error(e);
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
        }).catch(e => { 
          console.log("Error on voting_reminder_before_one_week_progress_report");
          console.error(e);
        })

        actions.push(progress_report_reminder_before_one_week_proposal_async, progress_report_reminder_before_one_week_progress_report_async);
      } else {
        console.log('No reminders sent to users');
        console.log('No of notification enabled preps: ' + preps_list.length);
        console.log('No of notification enabled contributors' + user_details_list.length);
      }
    }
  } catch (err) {
    throw new Error(err);
  } finally {
    return actions;
  }
}

module.exports = { sendEmailNotifications };