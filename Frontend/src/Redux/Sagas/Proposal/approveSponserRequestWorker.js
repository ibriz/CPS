import { sendTransaction } from "Redux/ICON/utils";
import { setSponsorRequestProposal } from "Redux/Reducers/proposalSlice";
import { put } from "redux-saga/effects";

function* approveSponserRequestWorker({ payload }) {
  const params = {
    _ipfs_key: payload.ipfsKey,
    _vote: "_accept",
    _vote_reason: payload.reason,
  };

  sendTransaction({
    method: "sponsor_vote",
    params,
    icxAmount: payload.sponsorBond,
    id: "approve_sponsor",
  });
  yield put(setSponsorRequestProposal({ proposal: payload.proposal }));

  console.log(params);
}

export default approveSponserRequestWorker;
