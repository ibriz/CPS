import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    previousEmail: null,
    email: null,
    firstName: null,
    lastName: null,
    enableEmailNotification: false,
    verified: false,
    userDataSubmitSuccess: false,
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
            state.enableEmailNotifications = action.payload.response.enableEmailNotifications
            state.verified = action.payload.response.verified;


        },
        fetchUserDataFailure(state) {
            return;
        },
        submitUserDataRequest(state) {
            state.previousEmail = state.email
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
        resendVerificationEmailSuccess(state, action) {
        },
        resendVerificationEmailFailure(state) {
            return;
        },

        setUserDataSubmitSuccess(state,action) {
            state.userDataSubmitSuccess = action.payload.status;
        }
    },
    extraReducers: {
        "account/logout": (state, action) => {
          state.email = null;
          state.firstName = null;
          state.lastName = null;
          state.enableEmailNotification = null;
          state.verified = false;
        }     
     }
    
})

export const { fetchUserDataRequest, fetchUserDataSuccess, fetchUserDataFailure, 
    submitUserDataRequest, submitUserDataSuccess, submitUserDataFailure,
    resendVerificationEmailRequest, resendVerificationEmailSuccess, resendVerificationEmailFailure, setUserDataSubmitSuccess
} = userSlice.actions;
export default userSlice.reducer;