import store from '../../Store';
import { signTransaction as signTxMethod } from 'Redux/ICON/utils';
import { login, signTransaction } from '../../Reducers/accountSlice';
import history from '../../../Router/history';
import { NotificationManager } from 'react-notifications';
import constants from '../constants';
import IconService from 'icon-sdk-js';
import { HttpProvider } from 'icon-sdk-js';
import {
  setModalShowSponsorRequests,
  setModalShowVoting,
  fetchProposalByAddressRequest,
  submitPriorityVotingRequest,
  fetchPriorityVotingRequest,
  setVotingPhase,
  VotingPhase,
} from 'Redux/Reducers/proposalSlice';
import { setModalShowVotingPR } from 'Redux/Reducers/progressReportSlice';
// import { fetchPeriodDetailsRequest } from 'Redux/Reducers/periodSlice';
import { loginPrepRequest, setHasAddress } from 'Redux/Reducers/accountSlice';
import {
  fetchSponsorRequestsListRequest,
  fetchProposalListRequest,
} from 'Redux/Reducers/proposalSlice';
import { fetchRemainingVotesRequest } from 'Redux/Reducers/proposalSlice';
import { fetchProgressReportListRequest } from 'Redux/Reducers/progressReportSlice';
import { fetchPeriodDetailsRequest } from 'Redux/Reducers/periodSlice';
import {
  fetchExpectedGrantRequest,
  fetchCPSTreasuryScoreAddressRequest,
} from 'Redux/Reducers/fundSlice';
import { provider } from '../utils';
import { request } from 'Redux/Sagas/helpers';
import {
  TRIGGER_SPONSOR_APPROVAL_EMAIL_NOTIFICATION,
  BACKEND_TRIGGER_URL,
  CPS_BOT_BASE_URL,
} from 'Redux/Constants';

// import { loginSuccess } from 'Redux/Reducers/accountSlice';

const {
  submitProposal,
  submitProgressReport,
  sponsor_vote,
  reject_sponsor,
  voteProposal,
  voteProgressReport,
  updatePeriod,
  unregisterPrep,
  registerPrep,
  payPrepPenalty,
  approve_sponsor,
  claim_reward,
  votePriority,
} = constants;

function setTimeoutPromise() {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, 2000);
  });
}

async function getResult({ txHash, successMessage, failureMessage }, callBack) {
  try {
    const iconService = new IconService(provider);
    await setTimeoutPromise();
    const result = await iconService.getTransactionResult(txHash).execute();
    console.log(result);
    store.dispatch(setVotingPhase(VotingPhase.IDLE));
    if (result.status === 0) {
      NotificationManager.error(result.failure.message, failureMessage);
    } else if (result.status === 1) {
      console.log('callback', typeof callBack);

      if (typeof callBack === 'function') {
        console.log('callback10');

        try {
          callBack();
        } catch (e) {
          console.group('CallbackError');
          console.error(e);
          console.groupEnd();
        } finally {
          NotificationManager.success(successMessage);
        }
      }
    }
    // console.log("callBack2", callBack, typeof callBack);
    // console.log("callBack");
    // callBack();
  } catch {
    console.log('Catch');
    getResult(
      {
        txHash,
        failureMessage,
        successMessage,
      },
      callBack,
    );
  }

  return;
}

export default event => {
  const { type, payload } = event.detail;
  window.icon = true;

  switch (type) {
    case 'RESPONSE_ADDRESS':
      console.log('login', payload);
      store.dispatch(login({ address: payload }));
      break;

    case 'RESPONSE_HAS_ADDRESS':
      console.log('RESPONSE_HAS_ADDRESS', payload);
      store.dispatch(setHasAddress({ hasAddress: payload.hasAddress }));
      break;

    case 'RESPONSE_SIGNING':
      console.log('RESPONSE_SIGNING', JSON.stringify(payload));
      console.log(JSON.stringify(payload));
      // console.log("getRaw", payload.getProperties());
      store.dispatch(signTransaction({ signature: payload }));

      break;

    case 'CANCEL_SIGNING':
      console.log('CANCEL_SIGNING', JSON.stringify(payload));
      store.dispatch(
        signTransaction({ signature: '-1', signatureRawData: '-1' }),
      );
      store.dispatch(setVotingPhase(VotingPhase.IDLE));
      break;

    case 'CANCEL_JSON-RPC':
      store.dispatch(setVotingPhase(VotingPhase.IDLE));
      break;

    case 'RESPONSE_JSON-RPC':
      console.log(payload);

      if (payload.code) {
        NotificationManager.error(payload.message, 'Transaction Failed');
        return;
      }

      switch (payload.id) {
        case submitProposal:
          console.log('history');
          history.push('/dashboard');
          history.push('/dashboard');
          // history.push('/proposals');
          history.goBack();
          history.goForward();

          // window.location.reload();
          NotificationManager.info('Proposal Creation Request Sent');

          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Proposal Creation Failed',
              successMessage: 'Proposal Created Successfully',
            },
            function () {
              store.dispatch(
                fetchProposalListRequest({
                  status: 'Pending',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              return true;
            },
          );

          break;

        case submitProgressReport:
          console.log('history');
          history.push('/voting');
          history.push('/voting');
          history.goBack();
          history.goForward();
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Progress Report Creation Failed',
              successMessage: 'Progress Report Created Successfully',
            },
            async function () {
              const signature = store.getState().account.signature;
              const payload = store.getState().account.signatureRawData;

              request({
                body: store.getState().proposals.backendTriggerData,
                url: BACKEND_TRIGGER_URL,
                baseUrl: CPS_BOT_BASE_URL,
                signature,
                payload,
              });

              store.dispatch(
                fetchProposalByAddressRequest({
                  walletAddress: store.getstate().account.address,
                }),
              );
              store.dispatch(
                fetchProgressReportListRequest({
                  status: 'Voting',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );

              return true;
            },
          );

          // window.location.reload();
          NotificationManager.info('Progress Report Creation Request Sent');
          break;

        case sponsor_vote:
          console.log('history');
          history.push('/');
          NotificationManager.info('Sponsor Vote Request Sent');

          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Sponsor Voting Failed',
              successMessage: 'Sponsor Voted Successfully',
            },
            function () {
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Pending',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Approved',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Rejected',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              return true;
            },
          );
          store.dispatch(setModalShowSponsorRequests(false));

          // setTimeout(() => window.location.reload(), 800);
          break;

        case approve_sponsor:
          console.log('history');
          history.push('/');
          NotificationManager.info('Sponsor request approval request sent');

          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Error accepting Sponsor Request',
              successMessage: 'Sponsor request accepted successfully',
            },
            async function () {
              const signature = store.getState().account.signature;
              const payload = store.getState().account.signatureRawData;

              request({
                body: store.getState().proposals.backendTriggerData,
                url: TRIGGER_SPONSOR_APPROVAL_EMAIL_NOTIFICATION,
                payload,
                signature,
              });

              request({
                body: {
                  eventType: 'sponsorApproval',
                  data: {
                    proposalIpfsHash:
                      store.getState().proposals.proposalDetail.ipfsHash,
                  },
                },
                payload,
                signature,
                baseUrl: CPS_BOT_BASE_URL,
                url: BACKEND_TRIGGER_URL,
              });

              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Pending',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Approved',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Rejected',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              return true;
            },
          );
          store.dispatch(setModalShowSponsorRequests(false));

          // setTimeout(() => window.location.reload(), 800);
          break;

        case reject_sponsor:
          console.log('history');
          history.push('/');
          NotificationManager.info('Sponsor request rejection request sent');

          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Error denying Sponsor Request',
              successMessage: 'Sponsor request denied successfully',
            },
            async function () {
              const signature = store.getState().account.signature;
              const payload = store.getState().account.signatureRawData;

              request({
                body: store.getState().proposals.backendTriggerData,
                url: TRIGGER_SPONSOR_APPROVAL_EMAIL_NOTIFICATION,
                payload,
                signature,
              });

              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Pending',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Approved',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              store.dispatch(
                fetchSponsorRequestsListRequest({
                  status: 'Rejected',
                  walletAddress: store.getState().account.address,
                  pageNumber: 1,
                }),
              );
              return true;
            },
          );
          store.dispatch(setModalShowSponsorRequests(false));

          // setTimeout(() => window.location.reload(), 800);
          break;

        case voteProposal:
          console.group('voteProposal');
          console.log('voteProposal', payload);

          console.groupEnd();
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Vote Proposal Failed',
              successMessage: 'Proposal Vote Succeded',
            },
            async function () {
              const signature = store.getState().account.signature;
              const payload = store.getState().account.signatureRawData;

              request({
                body: store.getState().proposals.backendTriggerData,
                url: BACKEND_TRIGGER_URL,
                baseUrl: CPS_BOT_BASE_URL,
                payload,
                signature,
              });
              store.dispatch(
                fetchRemainingVotesRequest({
                  type: 'proposal',
                }),
              );
              return true;
            },
          );
          store.dispatch(setModalShowVoting(false));

          // result = await iconService.getTransactionResult().execute();
          break;
        case voteProgressReport:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Vote Progress Report Failed',
              successMessage: 'Progress Report Vote Succeded',
            },
            async function () {
              const signature = store.getState().account.signature;
              const payload = store.getState().account.signatureRawData;

              request({
                body: store.getState().proposals.backendTriggerData,
                url: BACKEND_TRIGGER_URL,
                baseUrl: CPS_BOT_BASE_URL,
                signature,
                payload,
              });
              store.dispatch(
                fetchRemainingVotesRequest({
                  type: 'progress_reports',
                }),
              );
              return true;
            },
          );
          store.dispatch(setModalShowVotingPR(false));

          // result = await iconService.getTransactionResult().execute();
          break;

        case updatePeriod:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Period Update Failed',
              successMessage: 'Period Updated Successfully',
            },
            function () {
              store.dispatch(fetchPeriodDetailsRequest());
            },
          );

          // window.location.reload();
          NotificationManager.info('Period Update Request Sent');
          break;

        case unregisterPrep:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Prep Unregistration Failed',
              successMessage: 'Prep Unregistered Successfully',
            },
            function () {
              console.log('loginPrepRequestreq');

              store.dispatch(loginPrepRequest());
              console.log('loginPrepRequestsuccess');
              return true;
            },
          );

          // window.location.reload();
          NotificationManager.info('Prep Unregistration Request Sent');
          break;

        case registerPrep:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Prep Registration Failed',
              successMessage: 'Prep Registered Successfully',
            },
            function () {
              console.log('loginPrepRequestreq');

              store.dispatch(loginPrepRequest());
              console.log('loginPrepRequestsuccess');
              return true;
            },
          );

          // window.location.reload();
          NotificationManager.info('Prep Registration Request Sent');
          break;

        case payPrepPenalty:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Prep Penalty Pay Failed',
              successMessage: 'Penalty Paid Successfully',
            },
            function () {
              store.dispatch(loginPrepRequest());
              return true;
            },
          );

          // window.location.reload();
          NotificationManager.info('Prep Penalty Sent');
          break;

        case claim_reward:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Reward Claim Failed',
              successMessage: 'Reward Claimed Successfully',
            },
            function () {
              store.dispatch(fetchCPSTreasuryScoreAddressRequest());
              store.dispatch(
                fetchExpectedGrantRequest({
                  type: 'proposalGrant',
                }),
              );

              if (
                store.getState().account.isPrep &&
                store.getState().account.isRegistered
              ) {
                store.dispatch(
                  fetchExpectedGrantRequest({
                    type: 'sponsorReward',
                  }),
                );
              }
              return true;
            },
          );

          // window.location.reload();
          NotificationManager.info('Reward Claim Request Sent');
          break;

        // case claim_sponsor_bond:
        //   getResult({
        //     txHash: payload.result,
        //     failureMessage: 'Sponsor Bond Claim Failed',
        //     successMessage: 'Sponsor Bond Claimed Successfully',
        //   });

        //   // window.location.reload();
        //   NotificationManager.info('Sponsor bond claimed successfully');
        //   break;

        case votePriority:
          getResult(
            {
              txHash: payload.result,
              failureMessage: 'Priority Voting Request Failed',
              successMessage: 'Priority Voting Set Successfully',
            },
            function () {
              store.dispatch(fetchPriorityVotingRequest());
              return true;
            },
          );
          NotificationManager.info('Priority Voting Request Sent');
          break;
        default:
          break;
      }
      break;

    default:
      return;
  }
};
