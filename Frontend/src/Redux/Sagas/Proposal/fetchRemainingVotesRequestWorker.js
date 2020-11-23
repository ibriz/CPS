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
        //     ));
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