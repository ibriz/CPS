import { createSlice } from '@reduxjs/toolkit';
import {IconConverter} from 'icon-sdk-js';

const initialState = {
    cpfRemainingFunds: 0,
    cpfScoreAddress: null
};



const fundSlice = createSlice({
    name: 'fund',
    initialState,
    reducers: {

        fetchCPFScoreAddressRequest() {
            return;
        },
        fetchCPFScoreAddressSuccess(state, action) {
            state.cpfScoreAddress = action.payload.response;

            return;
        },
        fetchCPFScoreAddressFailure() {
            return;
        },


        fetchCPFRemainingFundRequest() {
            return;
        },
        fetchCPFRemainingFundSuccess(state, action) {
            state.cpfRemainingFunds = IconConverter.toBigNumber(action.payload.response).dividedBy(10**18);
            // state.cpfScoreAddress = action.payload.response;

            return;
        },
        fetchCPFRemainingFundFailure() {
            return;
        },
    },
})

export const { fetchCPFScoreAddressRequest, fetchCPFScoreAddressSuccess, fetchCPFScoreAddressFailure,
    fetchCPFRemainingFundRequest, fetchCPFRemainingFundSuccess, fetchCPFRemainingFundFailure
} = fundSlice.actions;
export default fundSlice.reducer;