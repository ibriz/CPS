import store from '../../Store';
import { sendTransaction } from '../../ICON/utils';

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
        _title: payload.proposal.projectName,
        _total_budget: parseInt(payload.proposal.totalBudget).toFixed(),
        sponsor_address: payload.proposal.sponserPrep,
        _ipfs_hash: payload.response.hash,
        _ipfs_key: payload.response.ipfsKey,
        _ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
        project_period: `${payload.proposal.projectDuration}`

    }

    sendTransaction({
        method: 'submit_proposal',
        params,
        icxAmount: 50,
    }
    )

    console.log(params);
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