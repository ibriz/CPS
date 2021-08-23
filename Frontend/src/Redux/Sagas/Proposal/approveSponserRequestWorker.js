import { bnUSDScore, CPSScore, sendTransaction } from 'Redux/ICON/utils';
import { setBackendTriggerData, setSponsorRequestProposal } from "Redux/Reducers/proposalSlice";
import { put } from 'redux-saga/effects';
import IconService from 'icon-sdk-js';


function* approveSponserRequestWorker({ payload }) {
  const { IconAmount, IconConverter } = IconService;
  const data = JSON.stringify({
    method: 'sponsor_vote',
    params: {
      ipfs_hash: payload.ipfsKey,
      vote: '_accept',
      vote_reason: payload.reason,
    }
  });
  const params = { '_to': CPSScore, '_value': IconConverter.toHex(IconAmount.of(payload.sponsorBond, IconAmount.Unit.ICX).toLoop()), "_data": IconConverter.toHex(data) }
  sendTransaction({
    method: 'transfer',
    params,
    id: 'approve_sponsor',
    scoreAddress:bnUSDScore
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
