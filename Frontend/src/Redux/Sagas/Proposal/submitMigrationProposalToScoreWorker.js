import { sendTransaction } from '../../ICON/utils';

function* submitMigrationProposalToScoreWorker({ payload }) {
  console.log('submitMigrationProposalToScoreWorker');
  console.log("payload",payload);

  // const params = {
  //     _title: payload.proposal.projectName,
  //     _total_budget: parseInt(payload.proposal.totalBudget),
  //     sponsor_address: store.getState().account.address,
  //     _ipfs_hash: payload.response.data.hash

  // }

  const params = {
    oldHash:payload.proposal.oldIpfsKey,
    newProposal: {
      ipfs_hash: payload.response.hash,
      project_title: payload.proposal.projectName,
      project_duration: `${payload.proposal.projectDuration}`,
      total_budget: parseInt(payload.proposal.totalBudget).toFixed(),
      sponsor_address: payload.proposal.sponserPrep,
      isMilestone: `0x${Number(!!payload.proposal.milestoneCount)}`,
      ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
      milestoneCount: `${payload.proposal.milestones.length}`,
      token: 'bnUSD',
    },
    milestones:payload.proposal.milestones.map((x)=> x?.id)
  };

  sendTransaction({
    method: 'submitProposalMock',
    params
  });

  console.log(params);
// try{
//       const response = yield call(submitProposal, payload.proposal);
//       yield put(submitProposalSuccess(
//         {
//           response,
//           proposal: payload.proposal
//         }
//       ));
//     } catch (error) {
//       yield put(submitProposalFailure());
//     }
}

export default submitMigrationProposalToScoreWorker;
