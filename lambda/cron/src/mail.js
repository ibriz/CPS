const AWS = require('aws-sdk');
// SES initialize
const SES = new AWS.SES({
	'region': process.env.SES_REGION
});

const emailFrom = process.env.EMAIL_FROM;

async function send_bulk_email(template, userDetails, subject, default_params = '') {
	console.log(userDetails);
	if (userDetails.length > 0) {
		let params = {
			Source: emailFrom,
			Template: template,
			Destinations: [],
			DefaultTemplateData: `{\"subject\": \"${subject}\",
								\"frontend_url\":\"${process.env.FRONTEND_URL}\"` + 
								default_params + `}`
		}

		for (const user of userDetails) {
			params.Destinations.push({
				Destination: {
					ToAddresses: [user.email]
				},
				ReplacementTemplateData: user.replacementTemplateData
			})
		}

		console.log('Params for sending email' + params);

		try {
			await SES.sendBulkTemplatedEmail(params).promise();
			console.log('Email successfully sent params: ' + JSON.stringify(params));
		} catch (e) {
			console.error(e);
			console.error('Email sending Failed! ' + JSON.stringify(params));
			throw new Error(e);
		}
	}
}

module.exports = { send_bulk_email }