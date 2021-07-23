import { keyStore, password } from "./keystore";
import { IconWallet } from "icon-sdk-js";

const wallet = IconWallet.loadKeystore(keyStore, password);

export default wallet;
