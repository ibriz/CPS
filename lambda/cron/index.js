const cron = require('./src/cron');
const { sendEmailNotifications } = require('./src/emailNotifications');
const { BRIDGE_EVENT_TYPES } = require('./src/constants');

exports.handler = async (event) => {
	try {
		if(event.bridgeEventType) {
			let cron_actions, response_msg;
			if(event.bridgeEventType == BRIDGE_EVENT_TYPES.periodChangeNotifications) {
				console.log("Sending notifications on period change");
				cron_actions = await cron.execute();
				console.log(cron_actions);

				response_msg = 'Successfully checked for period change and sent email/bot notifications';

			} else if(event.bridgeEventType == BRIDGE_EVENT_TYPES.reminders) {
				console.log("Sending email reminders about CPS periods");
				cron_actions = await sendEmailNotifications();
				console.log(cron_actions);

				response_msg = 'Successfully sent email reminders to PReps';
			} else {
				throw new Error("Invalid bridgeEventType");
			}

			await Promise.all(cron_actions);
			
			return {
				statusCode: 200,
				headers: {
					'Access-Control-Allow-Origin': '*'
				},
				body: response_msg
			}

		} else {
			throw new Error("Invalid lambda invocation method");
		}
	} catch (err) {

		console.log(err);
		return {
			statusCode: err.statusCode ? err.statusCode : 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			},
			body: JSON.stringify({
				error: err.name ? err.name : 'Exception',
				message: err.message ? err.message : 'Unknown error',
			}),
		};
	}
};