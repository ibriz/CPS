const AWS = require('aws-sdk');
const fs = require('fs');
const IconService = require('icon-sdk-js');
const { resolve } = require('path');
const redis = require('redis');

// Environment variable declaration
const emailFrom = process.env.MAIL_FROM;
const provider = process.env.PROVIDER;
const score_address = process.env.CONTRACT_ADDRESS;
const subject = process.env.SUBJECT;

// SES initialize
const SES = new AWS.SES();

// Redis initialize
const client = redis.createClient(process.env.REDIS_URL);
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);

// ICON initialize
const {
    IconBuilder,
    HttpProvider,
  } = IconService;
const { CallBuilder } = IconBuilder;
const httpProvider = new HttpProvider(provider);
const iconService = new IconService(httpProvider);


async function send_email(receiver_type, emailToAddresses) {
    console.log(emailToAddresses);
    var body = fs.readFileSync('./sponsors-body.html').toString()
    if(receiver_type == "preps"){
        body = fs.readFileSync('./preps-body.html').toString()
    }
    for (const email of emailToAddresses){
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
            console.log("Email Sent Successfully to "+ email)
        } catch (e) {
            console.error(e);
            console.error("Email sending Failed! " + email);
        }
    }
}

function icon_call_builder(methodName) {
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(score_address)
        .method(methodName)
        .build();
    return call;
}

async function populate_notification_enabled_addresses(addresses_list){
    let address_notification_list = [];
    try {
        for (const address of addresses_list){
            console.log("Address: " + address);
            const address_details = await getAsync(address);
            console.log("Details: "+ address_details);
            
            if(address_details != null){
                const json_address_details = JSON.parse(address_details);
                const address_notification_enabled = json_address_details.enableEmailNotifications;
                const address_email = json_address_details.email;
             
                if(address_notification_enabled == true){
                    console.log("Address notification enabled: " + address_email);
                    if(address_notification_list.indexOf(address_email) === -1) {
                        address_notification_list.push(address_email);
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
        console.error("Error getting addresses from Redis!");
    } finally {
        return address_notification_list;
    }
}

console.log("CPS Send email triggered");
exports.handler = async event => {
    
    console.log("RPC Call for Sponsors list");
    const sponsors_list = await iconService.call(icon_call_builder('get_sponsors_list')).execute();
   
    const sponsor_async = populate_notification_enabled_addresses(sponsors_list).then(async (sponsor_notification_list) => {
        console.log(sponsor_notification_list)
        console.log("Sending emails to " + sponsor_notification_list.length + " sponsors");
        await send_email('sponsors',sponsor_notification_list )
    });
   
    // call rpc for preps list
    // get emails for preps from redis
    // send email for preps 
  
    const preps_list = await iconService.call(icon_call_builder('get_PReps')).execute();
    
    console.log("PReps list: "+preps_list);
   
    const preps_async = populate_notification_enabled_addresses(preps_address_list).then(async (preps_notification_list) => {
        console.log(preps_notification_list)
        console.log("Sending emails to " + preps_notification_list.length + " PReps");
        await send_email('preps',preps_notification_list )
    });


    // var preps_notification_list = await populate_notification_enabled_addresses(preps_list);
    // console.log(preps_notification_list);
    // // console.log("Sending emails to " + preps_notification_list.length + " PReps");
    // send_email('preps',preps_notification_list );  
    return Promise.all([sponsor_async, preps_async]).then(() => {
         Promise.resolve({
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            result: "Email sucessfully sent. Check logs for more details."
        });
     });
};