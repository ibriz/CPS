import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  previousEmail: null,
  email: null,
  firstName: null,
  lastName: null,
  enableEmailNotification: false,
  verified: false,
  userDataSubmitSuccess: false,
  initialPrompt: false,
  theme: 'light',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUserDataRequest(state) {
      return;
    },
    fetchUserDataSuccess(state, action) {
      state.firstName = action.payload.response.firstName;
      state.lastName = action.payload.response.lastName;
      state.email = action.payload.response.email;
      state.enableEmailNotifications =
        action.payload.response.enableEmailNotifications;
      state.verified = action.payload.response.verified;
    },
    fetchUserDataFailure(state) {
      return;
    },
    submitUserDataRequest(state) {
      state.previousEmail = state.email;
      return;
    },
    submitUserDataSuccess(state, action) {
      state.userDataSubmitSuccess = true;
    },
    submitUserDataFailure(state) {
      return;
    },

    resendVerificationEmailRequest(state) {
      return;
    },
    resendVerificationEmailSuccess(state, action) {},
    resendVerificationEmailFailure(state) {
      return;
    },

    setUserDataSubmitSuccess(state, action) {
      state.userDataSubmitSuccess = action.payload.status;
    },

    fetchUserPromptRequest(state, action) {},
    fetchUserPromptSuccess(state, action) {
      console.log(
        'fetchUserPromptSuccess',
        action.payload.response.intialprompt,
      );
      state.initialPrompt = action.payload.response.intialprompt ?? true;
    },
    fetchUserPromptFailure(state, action) {
      state.initialPrompt = true;
    },

    disableUserPromptRequest(state, action) {},
    disableUserPromptSuccess(state, action) {},
    disableUserPromptFailure(state, action) {},

    setThemeRequest(state, action) {
      state.theme = action.payload;
    },
  },
  extraReducers: {
    'account/logout': (state, action) => {
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.enableEmailNotification = null;
      state.verified = false;
    },
  },
});

export const {
  fetchUserDataRequest,
  fetchUserDataSuccess,
  fetchUserDataFailure,
  submitUserDataRequest,
  submitUserDataSuccess,
  submitUserDataFailure,
  resendVerificationEmailRequest,
  resendVerificationEmailSuccess,
  resendVerificationEmailFailure,
  setUserDataSubmitSuccess,
  fetchUserPromptRequest,
  fetchUserPromptSuccess,
  fetchUserPromptFailure,
  disableUserPromptRequest,
  disableUserPromptSuccess,
  disableUserPromptFailure,
  setThemeRequest,
} = userSlice.actions;
export default userSlice.reducer;
