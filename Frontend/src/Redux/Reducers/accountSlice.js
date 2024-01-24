import { createSlice } from '@reduxjs/toolkit';
import IconService from 'icon-sdk-js';

const { IconConverter } = IconService;

const initialState = {
  address: null,
  isPrep: null,
  isRegistered: false,
  payPenalty: false,
  loginType: '',
  penaltyAmount: 15,
  walletBalance: 0,
  signature: null,
  signatureRawData: null,
  hasAddress: null,
  loginButtonClicked: false,
  unchangedPenaltyAmount: 0,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    login(state, action) {
      state.address = action.payload.address;
    },
    logout(state) {
      state.isPrep = null;
      state.address = null;
      state.signature = null;
    },
    setLoginButtonClicked(state, action) {
      state.loginButtonClicked = action.payload.click;
    },
    loginRequest(state) { },
    loginPrepRequest(state) { },
    loginSuccess(state, action) {
      state.isPrep = action.payload.isPrep;
      state.isRegistered = action.payload.isRegistered;
      state.votingPRep=action.payload.votingPRep;
      state.payPenalty = action.payload.payPenalty;
      state.penaltyAmount = IconConverter.toBigNumber(
        action.payload.penaltyAmount,
      ).dividedBy(10 ** 18);
      state.unchangedPenaltyAmount = action.payload.penaltyAmount;
      state.walletBalance = IconConverter.toBigNumber(
        action.payload.walletBalance,
      ).dividedBy(10 ** 18);
    },

    setHasAddress(state, action) {
      state.hasAddress = action.payload.hasAddress;
    },

    signTransaction(state, action) {
      state.signature = action.payload.signature;
      state.signatureRawData = action.payload.signatureRawData ?? null;
    },
  },
});

export const {
  login,
  logout,
  loginRequest,
  loginPrepRequest,
  loginSuccess,
  signTransaction,
  setHasAddress,
  setLoginButtonClicked,
} = accountSlice.actions;
export default accountSlice.reducer;
