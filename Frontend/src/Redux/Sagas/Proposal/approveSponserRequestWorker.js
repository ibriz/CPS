import { sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData, setSponsorRequestProposal } from "Redux/Reducers/proposalSlice";
import { put} from 'redux-saga/effects';

function* approveSponserRequestWorker({ payload }) {
  const params = {
    _ipfs_key: payload.ipfsKey,
    _vote: '_accept',
    _vote_reason: payload.reason,
  };

  sendTransaction({
    method: 'sponsor_vote',
    params,
    icxAmount: payload.sponsorBond,
    id: 'approve_sponsor',
  });
  yield put(setSponsorRequestProposal({ proposal: payload.proposal }));

    yield put(
        setBackendTriggerData({
                projectName: payload.proposal.title,
                address: payload.proposal.contributorAddress,
                sponsorAddress: payload.proposal.sponsorAddress,
                sponsorAction: 'accepted'
            })
    );
    
    console.log(params);
}

export default approveSponserRequestWorker;
