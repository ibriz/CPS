import { sendTransaction } from '../../ICON/utils';

function* submitProposalToScoreWorker({ payload }) {
  console.log('submitProposalToScoreWorker');
  console.log(payload);

  // const params = {
  //     _title: payload.proposal.projectName,
  //     _total_budget: parseInt(payload.proposal.totalBudget),
  //     sponsor_address: store.getState().account.address,
  //     _ipfs_hash: payload.response.data.hash

  // }

  const params = {
    proposals: {
      ipfs_hash: payload.response.hash,
      project_title: payload.proposal.projectName,
      project_duration: `${payload.proposal.projectDuration}`,
      total_budget: parseInt(payload.proposal.totalBudget).toFixed(),
      sponsor_address: payload.proposal.sponserPrep,
      ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
      milestoneCount: `${payload.proposal.milestoneCount}`,
      token: 'bnUSD',
    },
  };

  sendTransaction({
    method: 'submitProposal',
    params,
    icxAmount: 50,
  });

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
