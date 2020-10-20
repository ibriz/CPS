import { createSlice} from '@reduxjs/toolkit'

const initialState = {
  address: null,
  isPrep: null,
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
    loginSuccess(state, payload) {
      state.isPrep = payload.payload.isPrep
    }
  },
})

export const { login, logout, loginRequest, loginPrepRequest, loginSuccess  } = accountSlice.actions;
export default accountSlice.reducer;