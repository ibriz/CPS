import { createSlice} from '@reduxjs/toolkit';
import IconService from 'icon-sdk-js';


const {IconConverter} = IconService;

const initialState = {
  address: null,
  isPrep: null,
  isRegistered: false,
  payPenalty: false,
  loginType: '',
  penaltyAmount: 15,
  walletBalance: 0
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    login(state, action) {
      state.address = action.payload.address
    },
    logout(state) {
      state.address = null;
    },
    loginRequest(state) {
    },
    loginPrepRequest(state) {
    },
    loginSuccess(state, action) {
      state.isPrep = action.payload.isPrep
      state.isRegistered = action.payload.isRegistered
      state.payPenalty = action.payload.payPenalty
      state.penaltyAmount = action.payload.penaltyAmount
      state.walletBalance = IconConverter.toBigNumber(action.payload.walletBalance).dividedBy(10**18);

    },

  },
})

export const { login, logout, loginRequest, loginPrepRequest, loginSuccess  } = accountSlice.actions;
export default accountSlice.reducer;