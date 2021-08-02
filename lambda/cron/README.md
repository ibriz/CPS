CPS Send Notification / Email
=======

Environment Variable:
- API_KEY                           qeTasdcn==
- API_SECRET                        nacPuTacnsd==
- REDIS_URL                         redis://localhost:6379
- BLOCKCHAIN_PROVIDER               https://bicon.net.solidwallet.io/api/v3
- SCORE_ADDRESS                     cx...........
- PRIVATE_KEY                       a............
- USER_ADDRESS                      hx...........   (random address)
- NID                               3
- EMAIL_FROM                        icon@ibriz.ai
- ICX_PENALTY                       1500

Triggered by AWS event bridge (Configure eventBridge to send Constant (JSON text))

Supported BridgeEventType (sent as event.detail from AwsEventBridge): "periodChangeNotifications" and "reminders"

https://stackoverflow.com/questions/66064163/using-an-eventbridge-event-pattern-string-in-a-lambda-function