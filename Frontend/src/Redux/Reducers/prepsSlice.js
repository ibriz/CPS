import { createSlice } from '@reduxjs/toolkit';
const BigNumber = require('bignumber.js');

const initialState = {
  preps: [],
  sponsorBondPercentage: null,
  prepsWithStats: null,
  loading: false,
};

const prepsSlice = createSlice({
  name: 'preps',
  initialState,
  reducers: {
    fetchPrepsRequest(state) {
      return;
    },
    fetchPrepsSuccess(state, action) {
      state.preps = action.payload.map(prep => {
        if (typeof prep === 'string')
          return {
            address: prep,
            name: prep,
          };
        else
          return {
            name: prep.name,
            address: prep.address,
          };
      });
    },
    fetchPrepsFailure(state) {
      return;
    },
    unregisterPrep() {
      return;
    },
    registerPrep() {
      return;
    },
    payPenalty() {
      return;
    },

    fetchPrepsWithStatsRequest(state) {
      return;
    },
    fetchPrepsWithStatsSuccess(state, action) {
      state.prepsWithStats = action.payload.prepsWithStats;
      state.loading = action.payload.loading;
    },
    fetchPrepsWithStatsFailure(state) {
      return;
    },
    fetchSponsorBondPercentageRequest(state) {
      return;
    },
    fetchSponsorBondPercentageSuccess(state, action) {
      state.sponsorBondPercentage = BigNumber(action.payload).toFixed() / 100;
      console.log(
        '=================================',
        BigNumber(action.payload).toFixed() / 100,
      );
    },
    fetchSponsorBondPercentageFailure(state, action) {
      console.log('###################################', action.payload);
    },
  },
});

export const {
  fetchPrepsRequest,
  fetchPrepsSuccess,
  fetchPrepsFailure,
  fetchPrepsWithStatsRequest,
  fetchPrepsWithStatsSuccess,
  fetchPrepsWithStatsFailure,
  unregisterPrep,
  registerPrep,
  payPenalty,
  fetchSponsorBondPercentageRequest,
  fetchSponsorBondPercentageSuccess,
  fetchSponsorBondPercentageFailure,
} = prepsSlice.actions;
export default prepsSlice.reducer;
