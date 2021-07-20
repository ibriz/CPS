const cron = require('./src/cron');

exports.handler = async (event) => {
	try {

		if (event.hasOwnProperty('httpMethod') && event.httpMethod === 'GET') {
			await cron.execute();
			console.log('==============Invoke Successful==========');
			Promise.resolve({
				statusCode: 200,
				headers: {
					'Access-Control-Allow-Origin': '*'
				},
				body: 'Successfully triggered notifications on proposal change'
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