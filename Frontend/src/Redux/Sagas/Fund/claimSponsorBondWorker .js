import { sendTransaction, CPSScore } from "Redux/ICON/utils";
import { select } from "redux-saga/effects";

function* claimSponsorBondWorker({ payload }) {
  sendTransaction({
    method: "claimSponsorBond",
  });
}

export default claimSponsorBondWorker;
