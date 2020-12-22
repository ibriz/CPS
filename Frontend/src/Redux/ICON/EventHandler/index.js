import store from '../../Store';
import { login, signTransaction } from '../../Reducers/accountSlice';
import history from '../../../Router/history';
import { NotificationManager } from 'react-notifications';
import constants from '../constants';
import IconService from 'icon-sdk-js';
import { HttpProvider } from 'icon-sdk-js';
import { setModalShowSponsorRequests, setModalShowVoting, fetchProposalByAddressRequest } from 'Redux/Reducers/proposalSlice';
import { setModalShowVotingPR } from 'Redux/Reducers/progressReportSlice';
// import { fetchPeriodDetailsRequest } from 'Redux/Reducers/periodSlice';
import { loginPrepRequest, setHasAddress } from 'Redux/Reducers/accountSlice';
import { fetchSponsorRequestsListRequest, fetchProposalListRequest } from 'Redux/Reducers/proposalSlice';
import { fetchRemainingVotesRequest } from 'Redux/Reducers/proposalSlice';
import {fetchProgressReportListRequest} from 'Redux/Reducers/progressReportSlice';
import {fetchPeriodDetailsRequest} from 'Redux/Reducers/periodSlice';

// import { loginSuccess } from 'Redux/Reducers/accountSlice';

const { submit_proposal,
    submit_progress_report,
    sponsor_vote,
    reject_sponsor,
    vote_proposal,
    vote_progress_report,
    update_period,
    unregister_prep,
    register_prep,
    pay_prep_penalty } = constants;

function setTimeoutPromise() {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, 2000);
    })
}

async function getResult({ txHash,
    successMessage,
    failureMessage,
}, callBack) {

    try {

        const provider = new HttpProvider('https://bicon.net.solidwallet.io/api/v3');
        // const provider = new HttpProvider('https://zicon.net.solidwallet.io/api/v3');
        const iconService = new IconService(provider);
        await setTimeoutPromise();
        const result = await iconService.getTransactionResult(txHash).execute();
        console.log(result);
        if (result.status === 0) {
            NotificationManager.error(result.failure.message, failureMessage)
        }
        else if (result.status === 1) {
            console.log("callback", typeof callBack);

            if (typeof callBack === "function") {
                console.log("callback10");

                try {
                    callBack();
                } catch {
                    console.log("CallbackError")
                } finally {
                    NotificationManager.success(successMessage);

                }
            }


        }
        // console.log("callBack2", callBack, typeof callBack);
        // console.log("callBack");
        // callBack();

    }
    catch {
        console.log("Catch");
        getResult(
            {
                txHash,
                failureMessage,
                successMessage
            },
            callBack
        );
    }


    return;
};

export default (event) => {
    const { type, payload } = event.detail;


    switch (type) {
        case 'RESPONSE_ADDRESS':
            console.log("login", payload);
            store.dispatch(login({ address: payload }));
            break;

        case 'RESPONSE_HAS_ADDRESS':
            console.log("RESPONSE_HAS_ADDRESS", payload);
            store.dispatch(setHasAddress({ hasAddress: payload.hasAddress }));
            break;

        case 'RESPONSE_SIGNING':
            console.log("RESPONSE_SIGNING", JSON.stringify(payload));
            console.log(JSON.stringify(payload));
            // console.log("getRaw", payload.getProperties());
            store.dispatch(signTransaction({ signature: payload }));

            break;

        case 'RESPONSE_JSON-RPC':
            console.log(payload);

            if (payload.code) {
                NotificationManager.error(payload.message, "Transaction Failed");
                return;
            }

            switch (payload.id) {
                case submit_proposal:
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
                        successMessage: "Proposal Created Successfully",


                    }, function(){

                        store.dispatch( fetchProposalListRequest(
                            {
                                status: "Pending",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }
                        ));
                        return true;

                    });

                    break;

                case submit_progress_report:
                    console.log('history');
                    history.push('/progress-reports');
                    history.push('/progress-reports');
                    history.goBack();
                    history.goForward();
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Progress Report Creation Failed",
                        successMessage: "Progress Report Created Successfully"
                    },  function(){
                        store.dispatch( fetchProposalByAddressRequest(
                            {
                                walletAddress: store.getstate().account.address,
                            }));
                        store.dispatch(  fetchProgressReportListRequest(
                            {
                                status: "Voting",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }        
                        ));


                        return true;

                    });

                    // window.location.reload();
                    NotificationManager.info("Progress Report Creation Request Sent");
                    break;

                case sponsor_vote:
                    console.log('history');
                    history.push('/');
                    NotificationManager.info("Sponsor Vote Request Sent");

                    getResult({
                        txHash: payload.result,
                        failureMessage: "Sponsor Voting Failed",
                        successMessage: "Sponsor Voted Successfully"
                    }, function(){

                        store.dispatch(fetchSponsorRequestsListRequest(
                            {
                                status: "Pending",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }
                        ));
                        store.dispatch(fetchSponsorRequestsListRequest(
                            {
                                status: "Approved",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }
                        ));
                        store.dispatch(fetchSponsorRequestsListRequest(
                            {
                                status: "Rejected",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }
                        ));
                        return true;

                    });
                    store.dispatch(setModalShowSponsorRequests(false));

                    // setTimeout(() => window.location.reload(), 800); 
                    break;
                case reject_sponsor:
                    history.push('/');
                    NotificationManager.info("Proposal Rejection Request Sent");

                    getResult({
                        txHash: payload.result,
                        failureMessage: "Proposal Rejection Failed",
                        successMessage: "Proposal Rejected Successfully"
                    }, function(){

                        store.dispatch(fetchSponsorRequestsListRequest(
                            {
                                status: "Pending",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }
                        ));
                        store.dispatch(fetchSponsorRequestsListRequest(
                            {
                                status: "Approved",
                                walletAddress: store.getState().account.address,
                                pageNumber: 1
                            }
                        ));
                        return true;

                    });
                    store.dispatch(setModalShowSponsorRequests(false));


                    // setTimeout(() => window.location.reload(), 800);                 
                    break;

                case vote_proposal:
                    console.group("vote_proposal");
                    console.log(payload);

                    console.groupEnd();
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Vote Proposal Failed",
                        successMessage: "Proposal Vote Succeded"
                    }, function(){
                        store.dispatch(fetchRemainingVotesRequest(
                            {
                                type: "proposal"
                            }        
                        ));
                        return true;

                    });
                    store.dispatch(setModalShowVoting(false));

                    // result = await iconService.getTransactionResult().execute();
                    break;
                case vote_progress_report:

                    getResult({
                        txHash: payload.result,
                        failureMessage: "Vote Progress Report Failed",
                        successMessage: "Progress Report Vote Succeded"
                    }, function(){
                        store.dispatch(fetchRemainingVotesRequest(
                            {
                                type: "progress_report"
                            }        
                        ));
                        return true;

                    });
                    store.dispatch(setModalShowVotingPR(false));

                    // result = await iconService.getTransactionResult().execute();
                    break;

                case update_period:
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Period Update Failed",
                        successMessage: "Period Updated Successfully",

                    }, function() {
                        store.dispatch(fetchPeriodDetailsRequest());

                    });

                    // window.location.reload();
                    NotificationManager.info("Period Update Request Sent");
                    break;

                case unregister_prep:
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Prep Unregistration Failed",
                        successMessage: "Prep Unregistered Successfully",

                    }, function(){
                        console.log("loginPrepRequestreq");

                        store.dispatch(loginPrepRequest());
                        console.log("loginPrepRequestsuccess");
                        return true;

                    });

                    // window.location.reload();
                    NotificationManager.info("Prep Unregistration Request Sent");
                    break;

                case register_prep:
                    getResult({
                        txHash: payload.result,
                        failureMessage: "Prep Registration Failed",
                        successMessage: "Prep Registered Successfully",

                    }, function(){
                        console.log("loginPrepRequestreq");

                        store.dispatch(loginPrepRequest());
                        console.log("loginPrepRequestsuccess");
                        return true;
                    });

                    // window.location.reload();
                    NotificationManager.info("Prep Registration Request Sent");
                    break;
                
                    case pay_prep_penalty:
                        getResult({
                            txHash: payload.result,
                            failureMessage: "Prep Penalty Pay Failed",
                            successMessage: "Penalty Paid Successfully",
        
                        }, function(){
        
                            store.dispatch(loginPrepRequest());
                            return true;
                        });
        
                        // window.location.reload();
                        NotificationManager.info("Prep Penalty Sent");
                        break;
                default:
                    break;
            }
            break;

            

        default:
            return;





    }
}

