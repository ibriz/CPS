import { createSlice} from '@reduxjs/toolkit'

const initialState = {
  address: null,
  isPrep: null,
  isRegistered: false,
  payPenalty: false,
  loginType: ''
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
    },

  },
})

export const { login, logout, loginRequest, loginPrepRequest, loginSuccess  } = accountSlice.actions;
export default accountSlice.reducer;