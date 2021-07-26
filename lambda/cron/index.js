const cron = require('./src/cron');

exports.handler = async (event) => {
	try {

		if (event.hasOwnProperty('httpMethod') && event.httpMethod === 'POST') {
			await cron.proposal_notification(JSON.parse(event.body));

			const response = {
				statusCode: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				},
				body: JSON.stringify({
					message: "Email sent"
				})
			};

			return response;
		
		} else {
			
			const cron_actions = await cron.execute();

			console.log(cron_actions);

			return Promise.all(cron_actions).then(() => {
				console.log('==============Invoke Successful==========');
				Promise.resolve({
					statusCode: 200,
					headers: {
						'Access-Control-Allow-Origin': '*'
					},
					body: 'Email sucessfully sent and successfully notified CPS bot. Check logs for more details.'
				});
			});
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