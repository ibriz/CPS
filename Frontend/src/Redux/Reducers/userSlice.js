import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    email: null,
    firstName: null,
    lastName: null,
    enableEmailNotification: false
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


        },
        fetchUserDataFailure(state) {
            return;
        },
        submitUserDataRequest(state) {
            return;
        },
        submitUserDataSuccess(state, action) {
        },
        submitUserDataFailure(state) {
            return;
        },
    },
})

export const { fetchUserDataRequest, fetchUserDataSuccess, fetchUserDataFailure, 
    submitUserDataRequest, submitUserDataSuccess, submitUserDataFailure
} = userSlice.actions;
export default userSlice.reducer;