import store from '../../Store';
import {login} from '../../Reducers/accountSlice';
import history from '../../../Router/history';
import {NotificationManager} from 'react-notifications';
import constants from '../constants';
import IconService from 'icon-sdk-js';
import {HttpProvider} from 'icon-sdk-js';
import {setModalShowSponsorRequests, setModalShowVoting} from 'Redux/Reducers/proposalSlice';
import {setModalShowVotingPR} from 'Redux/Reducers/progressReportSlice';
import { fetchPeriodDetailsRequest } from 'Redux/Reducers/periodSlice';

const {_submitProposal,
        _submitProgressReport,
        _approve_sponsor,
        _reject_sponsor,
        _vote_proposal,
        _vote_progress_report,
        update_period } = constants;

function setTimeoutPromise() {
    return new Promise(function(resolve, reject) { 
          setTimeout(resolve, 2000); 
    })
}

 async function getResult({txHash,
        successMessage,
        failureMessage,
        callBack}) {
     try {
        const provider = new HttpProvider('https://bicon.net.solidwallet.io/api/v3');
        const iconService = new IconService(provider);
        await setTimeoutPromise();
        const result = await iconService.getTransactionResult(txHash).execute();
        console.log(result);
        if (result.status === 0) {
            NotificationManager.error(result.failure.message, failureMessage)
        }
        else if (result.status === 1) {
            NotificationManager.success(successMessage);
        }

        if(callBack) {
            console.log("callBack");
            callBack();
        }
     }
     catch {
         console.log("Catch");
         getResult(
             {
                 txHash,
                 failureMessage,
                 successMessage
             }
         );
     }

    return;
 };

export default (event) => {
    const { type, payload } = event.detail;


    switch (type) {
        case 'RESPONSE_ADDRESS':
            console.log("login",payload);
            store.dispatch(login({address: payload}));
            break;
        
        case 'RESPONSE_JSON-RPC':
            console.log(payload);

            if(payload.code) {
                NotificationManager.error(payload.message ,"Transaction Failed");
                return;
            }

            switch(payload.id) {
                case _submitProposal:
                    console.log('history');
                    history.push('/proposals');
                    history.push('/proposals');
                    history.goBack();
                    history.goForward();

                    // window.location.reload();
                    NotificationManager.info("Proposal Creation Request Sent");

                    getResult({
                        txHash: payload.result,
                        failureMessage: "Proposal Creation Failed",
                        successMessage: "Proposal Created Successfully"
                    });
                    break;

                case _submitProgressReport:
                    console.log('history');
                    history.push('/progress-reports');
                    history.push('/progress-reports');
                    history.goBack();
                    history.goForward();
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Progress Report Creation Failed",
                        successMessage: "Progress Report Created Successfully"
                    });
    
                        // window.location.reload();
                    NotificationManager.info("Progress Report Creation Request Sent");
                    break;

                case _approve_sponsor: 
                    console.log('history');
                    history.push('/sponsorRequests');
                    NotificationManager.info("Proposal Approval Request Sent"); 

                    getResult({
                        txHash: payload.result,
                        failureMessage: "Proposal Approval Failed",
                        successMessage: "Proposal Approved Successfully"
                    });
                    store.dispatch(setModalShowSponsorRequests(false));
                    
                    // setTimeout(() => window.location.reload(), 800); 
                break;
                case _reject_sponsor:
                    history.push('/sponsorRequests');
                    NotificationManager.info("Proposal Rejection Request Sent"); 

                    getResult({
                        txHash: payload.result,
                        failureMessage: "Proposal Rejection Failed",
                        successMessage: "Proposal Rejected Successfully"
                    });
                    store.dispatch(setModalShowSponsorRequests(false));

                    
                    // setTimeout(() => window.location.reload(), 800);                 
                break;   
                
                case _vote_proposal:
                    console.group("vote_proposal");
                    console.log(payload);

                    console.groupEnd();
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Vote Proposal Failed",
                        successMessage: "Proposal Vote Succeded"
                    });
                    store.dispatch(setModalShowVoting(false));

                    // result = await iconService.getTransactionResult().execute();
                    break;
                    case _vote_progress_report:

                        getResult({
                            txHash: payload.result,
                            failureMessage: "Vote Progress Report Failed",
                            successMessage: "Progress Report Vote Succeded"
                        });
                        store.dispatch(setModalShowVotingPR(false));
    
                        // result = await iconService.getTransactionResult().execute();
                        break;

                        case update_period:
                            getResult({
                                txHash: payload.result,
                                failureMessage: "Period Update Failed",
                                successMessage: "Period Updated Successfully",
                                callBack: () => store.dispatch(fetchPeriodDetailsRequest())
                            });
            
                                // window.location.reload();
                            NotificationManager.info("Period Update Request Sent");
                            break;
                default:
                    break;
            }
            break;

        default:
            return;
           



            
    }
}

