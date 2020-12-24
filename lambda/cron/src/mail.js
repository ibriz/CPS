const AWS = require('aws-sdk');
const fs = require('fs');
// SES initialize
const SES = new AWS.SES();

const emailFrom = process.env.EMAIL_FROM;

async function send_email(receiver_type, emailToAddresses, subject) {
    console.log(emailToAddresses);
    var body = fs.readFileSync(`../email_templates/${receiver_type}-body.html`).toString();
    for (const email of emailToAddresses) {
        const params = {
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: { Data: body }
                },
                Subject: {
                    Data: subject
                },
            },
            Source: emailFrom
        };

        try {
            await SES.sendEmail(params).promise();
            console.log("Email Sent Successfully to " + email)
        } catch (e) {
            console.error(e);
            console.error("Email sending Failed! " + email);
            throw new Error(error);
        }
    }
}

async function send_bulk_email(template, userDetails, subject, default_params) {
    console.log(userDetails);
    if (userDetails.length > 0) {
        let params = {
            Source: emailFrom,
            Template: template,
            Destinations: [],
            DefaultTemplateData: `{
                \"Subject\": \"${subject}\",
                \"default_params\":\"${default_params}\",
                \"frontend_url\":\"${process.env.FRONTEND_URL}\"
            }`
        }

        for (const user of userDetails) {
            params.Destinations.push({
                Destination: {
                    ToAddresses: [user.email]
                },
                ReplacementTemplateData: user.replacementTemplateData
            })
        }

        try {
            await SES.sendBulkTemplatedEmail(params).promise();
            console.log("Email successfully sent params: " + params);
        } catch (e) {
            console.error(e);
            console.error("Email sending Failed! " + params);
            throw new Error(e);
        }
    }
}

module.exports = { send_email, send_bulk_email }