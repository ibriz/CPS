import store from '../../Store';
import { sendTransaction } from '../../ICON/utils';
import { put } from '@redux-saga/core/effects';
import { setBackendTriggerData } from 'Redux/Reducers/proposalSlice';

function* submitProposalToScoreWorker({ payload }) {
    console.log("submitProposalToScoreWorker");
    console.log(payload);

    // const params = {
    //     _title: payload.proposal.projectName,
    //     _total_budget: parseInt(payload.proposal.totalBudget),
    //     sponsor_address: store.getState().account.address,
    //     _ipfs_hash: payload.response.data.hash

    // }

    const params = {
        _proposals: {
            project_title: payload.proposal.projectName,
            total_budget: parseInt(payload.proposal.totalBudget).toFixed(),
            sponsor_address: payload.proposal.sponserPrep,
            ipfs_hash: payload.response.hash,
            ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
            project_duration: `${payload.proposal.projectDuration}`
        }
     

    }

    sendTransaction({
        method: 'submit_proposal',
        params,
        icxAmount: 50,
    }
    )

    console.log(params);

    yield put(
        setBackendTriggerData({
            backendTriggerData: {
                project_title: payload.proposal.projectName,
                total_budget: parseInt(payload.proposal.totalBudget).toFixed(),
                sponsor_address: payload.proposal.sponserPrep,
                ipfs_hash: payload.response.hash,
                ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
                project_duration: `${payload.proposal.projectDuration}`
            }
        })
    );
    //     const response = yield call(submitProposal, payload.proposal);
    //     yield put(submitProposalSuccess(
    //       {
    //         response,
    //         proposal: payload.proposal
    //       }
    //     ));
    //   } catch (error) {
    //     yield put(submitProposalFailure());
    //   }
}

export default submitProposalToScoreWorker;
