import { put, call, select } from 'redux-saga/effects';
import { callKeyStoreWallet } from '../../ICON/utils';
// import {
//   getCourseInfo,
// } from '../services/api';
import { fetchRemainingVotesProposalSuccess, fetchRemainingVotesFailure } from '../../Reducers/proposalSlice';
import { fetchRemainingVotesPRSuccess } from '../../Reducers/progressReportSlice';

function* fetchRemainingVotesRequestWorker({ payload }) {
    try {

        const getAddress = (state) => state.account.address
        const walletAddress = yield select(getAddress);

            const response = yield call(callKeyStoreWallet, {
              method: 'get_remaining_project',
              params: {
                _wallet_address: walletAddress,
                _project_type: payload.type
            }
        });
        
        // let response
        // if (payload.type === "proposal") {
        //     response = Array(10).fill(0).map((_, index) => ({
        //         _status: "_sponsor_pending",
        //         _proposal_title: `${payload.status} ${payload.pageNumber}${index} New Proposal`,
        //         _contributor_address: (index % 2 === 0) ? "hx177b10efe3018961a405cc7c20ee811c552831a5" : "hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931",
        //         budget: 10000,
        //         _timestamp: 1600872145290985,
        //         _ipfs_hash: "bafybeih63y3v5goi3if4e3yrwsjnc2lv7uiesui2cuamfvvgebki5ewo2e",
        //         _ipfs_key: "proposal338e7daa-867e-4ea1-995b-b0e118b0036e",
        //         approved_votes: "0x410d586a20a4c00000",
        //         total_votes: "0xa2a15d09519be00000",
        //         completed_percentage: "0x20"
        //     }
        //     ));a
        // }

        // else {
        //      response = Array(10).fill(0).map((_, index) => ({
        //         _status: "_rejected",
        //         _project_report_title: `${payload.status} ${payload.pageNumber}${index} New Project Report`,
        //         _proposal_title: 'New Proposal',
        //         _contributor_address: 'hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931',
        //         _timestamp: 1600872145290985,
        //         _ipfs_hash: "bafybeidtxjlihr5rxkbtpa2smuwq7skj7gysuctaohx5lpwju26qt3k2ha",
        //         _report_key: 'report1234',
        //         _ipfs_key: 'ipfs1234',
        //         approved_votes: "0x410d586a20a4c00000",
        //         total_votes: "0xa2a15d09519be00000"
        //     }
        //     ))
        // }
        // let response;
        // if(payload.type === "proposal") {
        //  response = [
        //     {
        //         status: "_pending",
        //         project_title: "Video Content Marketing - Grow ICON Community",
        //         total_budget: "10000 ICX" ,
        //       timestamp: "1600872145290985",
        //       contributor_address: walletAddress,
        //       ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901d'
        //       },
      
        //       {
        //         status: "_pending",
        //         project_title: "ICON Mobile Wallet",
        //         total_budget: "12000 ICX" ,
        //       timestamp: "1600872144290885",
        //       contributor_address: walletAddress,
        //       ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901e'
      
        //       },
      
      
        //       {
        //         status: "_pending",
        //         project_title: "New Proposal 1",
        //         total_budget: "12000 ICX" ,
        //       timestamp: "1600872144290885",
        //       contributor_address: walletAddress,
        //       ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901f'
      
        //       },
        //       {
        //         status: "_pending",
        //         project_title: "New Proposal 2",
        //         total_budget: "12000 ICX" ,
        //       timestamp: "1600872144290885",
        //       contributor_address: walletAddress,
        //       ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901g'
      
        //       },
      
        //       {
        //         status: "_pending",
        //         project_title: "Video Content Marketing",
        //         total_budget: "10000 ICX" ,
        //       timestamp: "1600872145290985",
        //       contributor_address: walletAddress,
        //       ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901i'
        //       },
      
        //       {
        //         status: "_pending",
        //         project_title: "New Proposal",
        //         total_budget: "12000 ICX" ,
        //       timestamp: "1600872144290885",
        //       contributor_address: walletAddress,
        //       ipfs_hash: 'undefined46c3b07a-2f67-4caa-bc88-6290da31901h'
      
        //       },
      

        //     ];
        // } else {

        //  response = [

        //     {
        //         status: "_waiting",
        //         project_title: "ICON Mobile Wallet",
        //         total_budget: "12000 ICX" ,
        //         progress_report_title: 'UI Design Completed',
        //       timestamp: "1600872144290885",
        //       contributor_address: walletAddress,
        //       report_hash: 'bafybeifq7tbbe4khohvbsfwhrnqolpueogqkfsisngpn6t3tsdwallbmkm'
      
        //       },
        //     {
        //         status: "_waiting",
        //         project_title: "Video Content Marketing - Grow ICON Community",
        //         progress_report_title: 'First Draft Completed',
        //         // total_budget: "10000 ICX" ,
        //       timestamp: "1600872145290985",
        //       contributor_address: walletAddress,
        //       report_hash: 'bafybeictkcf2ryihvlzyizvvjkxlmbql6jiozeqnm3j5mlficbaour6kxq'
        //       },
    
      

        //     ];
        // }


        if (payload.type === "proposal") {
            yield put(fetchRemainingVotesProposalSuccess(
                {
                    response,
                }
            ));
        } else {
            yield put(fetchRemainingVotesPRSuccess(
                {
                    response,
                }
            ));
        }

    } catch (error) {
        yield put(fetchRemainingVotesFailure());
    }
}

export default fetchRemainingVotesRequestWorker;