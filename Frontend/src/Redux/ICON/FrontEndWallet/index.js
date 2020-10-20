import {keyStore, password} from './keystore';
import { IconAmount, IconConverter, IconBuilder, HttpProvider, IconWallet } from 'icon-sdk-js';


const wallet = IconWallet.loadKeystore(keyStore, password);

export default wallet;
