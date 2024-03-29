const subscriptionManager = require('./webhook-manager');
const triggerManager = require('./dataReceiver');
const periodChange = require('./periodChange/periodChange');
const { resHeaders } = require('./constants');

exports.handler = async (event) => {
  console.log(event.path);
  switch (event.path) {
    case process.env.SUBSCRIPTION_PATH:
      return await subscriptionManager.handler(event);
    case process.env.TRIGGER_PATH:
      return await triggerManager.handler(event);
    case process.env.PERIOD_CHANGE_NOTIFY_PATH:
      return await periodChange.handler(event);
    default:
      return {
        statusCode: 400,
        headers: resHeaders,
        body: JSON.stringify({
          error: 'Exception',
          message: 'Invalid URI path',
        }),
      }
  }
}