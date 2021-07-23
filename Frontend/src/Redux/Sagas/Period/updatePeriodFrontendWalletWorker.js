import { sendTransactionFrontendWallet } from "Redux/ICON/utils";

function* updatePeriodFrontendWalletWorker({ payload }) {
  try {
    sendTransactionFrontendWallet({
      method: "update_period",
    });
    console.log("success");
  } catch {
    console.log("failure");
  }
}

export default updatePeriodFrontendWalletWorker;
