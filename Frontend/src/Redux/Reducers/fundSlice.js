import { createSlice } from '@reduxjs/toolkit';
import {IconConverter} from 'icon-sdk-js';

const initialState = {
    cpfRemainingFunds: 0,
    cpfScoreAddress: null,

    cpsTreasuryScoreAddress: null,

    expectedGrant: 0,
    sponsorBond: 0

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



        fetchCPSTreasuryScoreAddressRequest() {
            return;
        },
        fetchCPSTreasuryScoreAddressSuccess(state, action) {
            state.cpsTreasuryScoreAddress = action.payload.response;

            return;
        },
        fetchCPSTreasuryScoreAddressFailure() {
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


        fetchExpectedGrantRequest() {
            return;
        },
        fetchExpectedGrantSuccess(state, action) {
            state.expectedGrant = action.payload.response.total_amount ? IconConverter.toBigNumber(action.payload.response.total_amount).dividedBy(10**18) : 0;
            state.sponsorBond = action.payload.response.sponsor_bond ? IconConverter.toBigNumber(action.payload.response.sponsor_bond).dividedBy(10**18) : 0;

            // state.cpfScoreAddress = action.payload.response;

            return;
        },
        fetchExpectedGrantFailure() {
            return;
        },
    },

    extraReducers: {
        "account/logout": (state, action) => {
          state.expectedGrant = 0;
          state.sponsorBond = 0;
        }     
     }
})

export const { fetchCPFScoreAddressRequest, fetchCPFScoreAddressSuccess, fetchCPFScoreAddressFailure,
    fetchCPFRemainingFundRequest, fetchCPFRemainingFundSuccess, fetchCPFRemainingFundFailure,
    fetchExpectedGrantRequest, fetchExpectedGrantSuccess, fetchExpectedGrantFailure,
    fetchCPSTreasuryScoreAddressRequest, fetchCPSTreasuryScoreAddressSuccess, fetchCPSTreasuryScoreAddressFailure
} = fundSlice.actions;
export default fundSlice.reducer;