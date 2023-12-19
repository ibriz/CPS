import { createSlice } from '@reduxjs/toolkit';
import { IconConverter } from 'icon-sdk-js';
const BigNumber = require('bignumber.js');

const initialState = {
  cpfRemainingFunds: { icx: 0, bnUSD: 0 },
  isMaintenanceMode: false,
  remainingSwapAmount: 0,
  prePaymentPercentage: 0,
  cpsTreasuryScoreAddress: null,
  cpfTreasuryScoreAddress: null,

  expectedGrant: { icx: 0, bnUSD: 0 },
  sponsorReward: { icx: 0, bnUSD: 0 },
  sponsorBond: { icx: 0, bnUSD: 0 },

  withDrawAmountSponsorReward: { icx: 0, bnUSD: 0 },
  withDrawAmountProposalGrant: { icx: 0, bnUSD: 0 },
  sponsorBondReward: { icx: 0, bnUSD: 0 },
  bnUSDScoreAddress: null,
  availableFund: 0,
  sponsorDepositAmount: { icx: 0, bnUSD: 0 },
};

const fundSlice = createSlice({
  name: 'fund',
  initialState,
  reducers: {
    fetchPrePaymentAmountRequest(state) {
      return;
    },
    fetchPrePaymentAmountSuccess(state, action) {
      console.log('Prepayment', action.payload)
      state.prePaymentPercentage = BigNumber(action.payload).toFixed() / 100;
      

      return;
    },
    fetchPrePaymentAmountFailure(state) {
      return;
    },
    fetchCPFTreasuryScoreAddressRequest() {
      return;
    },
    fetchCPFTreasuryScoreAddressSuccess(state, action) {
      state.cpfTreasuryScoreAddress = action.payload.response;

      return;
    },
    fetchCPFTreasuryScoreAddressFailure() {
      return;
    },

    fetchMaintenanceModeRequest() {
      return;
    },
    fetchMaintenanceModeSuccess(state, action) {
      state.isMaintenanceMode = Boolean(
        IconConverter.toNumber(action.payload.response),
      );
      return;
    },
    fetchMaintenanceModeFailure() {
      return;
    },

    fetchRemainingSwapAmountRequest() {
      return;
    },

    fetchRemainingSwapAmountSuccess(state, action) {
      state.remainingSwapAmount = IconConverter.toBigNumber(
        action.payload.response.maxCap,
      ).dividedBy(10 ** 18);
      return;
    },
    fetchRemainingSwapAmountFailure() {
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
      state.cpfRemainingFunds = {
        icx: IconConverter.toBigNumber(action.payload.response.ICX).dividedBy(
          10 ** 18,
        ),
        bnUSD: IconConverter.toBigNumber(
          action.payload.response.bnUSD,
        ).dividedBy(10 ** 18),
        sicx: IconConverter.toBigNumber(action.payload.response.sicx).dividedBy(
          10 ** 18,
        ),
        sicxToICX: IconConverter.toBigNumber(
          action.payload.response.sicxToICX,
        ).dividedBy(10 ** 18),
        sicxTobnUSD: IconConverter.toBigNumber(
          action.payload.response.sicxTobnUSD,
        ).dividedBy(10 ** 18),
      };
      // state.cpfTreasuryScoreAddress = action.payload.response;

      return;
    },
    fetchCPFRemainingFundFailure() {
      return;
    },
    fetchExpectedGrantRequest() {
      return;
    },
    fetchExpectedGrantSuccess(state, action) {
      if (action.payload.response.type === 'proposalGrant') {
        state.expectedGrant = {
          icx: action.payload.response.total_amount.ICX
            ? IconConverter.toBigNumber(
                action.payload.response.total_amount.ICX,
              ).dividedBy(10 ** 18)
            : 0,
          bnUSD: action.payload.response.total_amount.bnUSD
            ? IconConverter.toBigNumber(
                action.payload.response.total_amount.bnUSD,
              ).dividedBy(10 ** 18)
            : 0,
        };
        state.withDrawAmountProposalGrant = {
          icx: action.payload.response.withdraw_amount_icx
            ? IconConverter.toBigNumber(
                action.payload.response.withdraw_amount_icx,
              ).dividedBy(10 ** 18)
            : 0,
          bnUSD: action.payload.response.withdraw_amount_bnUSD
            ? IconConverter.toBigNumber(
                action.payload.response.withdraw_amount_bnUSD,
              ).dividedBy(10 ** 18)
            : 0,
        };
      } else {
        state.sponsorReward = {
          icx: action.payload.response.total_amount.ICX
            ? IconConverter.toBigNumber(
                action.payload.response.total_amount.ICX,
              ).dividedBy(10 ** 18)
            : 0,
          bnUSD: action.payload.response.total_amount.bnUSD
            ? IconConverter.toBigNumber(
                action.payload.response.total_amount.bnUSD,
              ).dividedBy(10 ** 18)
            : 0,
        };
        state.sponsorBond = {
          icx: action.payload.response.total_sponsor_bond.ICX
            ? IconConverter.toBigNumber(
                action.payload.response.total_sponsor_bond.ICX,
              ).dividedBy(10 ** 18)
            : 0,
          bnUSD: action.payload.response.total_sponsor_bond.bnUSD
            ? IconConverter.toBigNumber(
                action.payload.response.total_sponsor_bond.bnUSD,
              ).dividedBy(10 ** 18)
            : 0,
        };
        state.withDrawAmountSponsorReward = {
          icx: action.payload.response.withdraw_amount_icx
            ? IconConverter.toBigNumber(
                action.payload.response.withdraw_amount_icx,
              ).dividedBy(10 ** 18)
            : 0,
          bnUSD: action.payload.response.withdraw_amount_bnUSD
            ? IconConverter.toBigNumber(
                action.payload.response.withdraw_amount_bnUSD,
              ).dividedBy(10 ** 18)
            : 0,
        };
      }

      // state.cpfTreasuryScoreAddress = action.payload.response;

      return;
    },
    fetchExpectedGrantFailure() {
      return;
    },
    claimReward() {
      return;
    },
    claimSponsorBondReward() {
      return;
    },
    fetchSponsorBondRequest(state) {
      return;
    },
    fetchSponsorBondSuccess(state, action) {
      console.log('Sponsor', action);
      state.sponsorBondReward = {
        icx: action.payload.ICX
          ? IconConverter.toBigNumber(action.payload.ICX).dividedBy(10 ** 18)
          : 0,
        bnUSD: action.payload.bnUSD
          ? IconConverter.toBigNumber(action.payload.bnUSD).dividedBy(10 ** 18)
          : 0,
      };
    },
    fetchSponsorBondFailure() {
      return;
    },
    fetchbnUSDAddressRequest(state) {
      return;
    },
    fetchbnUSDAddressSuccess(state, action) {
      console.log('bnUSD Score', action);
      state.bnUSDScoreAddress = action.payload;
    },
    fetchbnUSDAddressFailure() {
      return;
    },
    fetchAvailableFundRequest() {
      return;
    },
    fetchAvailableFundSuccess(state, action) {
      state.availableFund = Number(
        IconConverter.toBigNumber(
          action?.payload?.availableFund || '0',
        ).dividedBy(10 ** 18) || 0,
      );
    },
    fetchAvailableFundFailure() {
      return;
    },
    fetchSponsorDepositAmountRequest(state) {
      return;
    },
    fetchSponsorDepositAmountSuccess(state, action) {
      const { ICX, bnUSD } = action.payload.response.total_sponsor_bond;
      console.log('Total sponsor bond: ', { ICX, bnUSD });
      state.sponsorDepositAmount = {
        icx: Number(
          IconConverter.toBigNumber(ICX || '0x0').dividedBy(10 ** 18),
        ),
        bnUSD: Number(
          IconConverter.toBigNumber(bnUSD || '0x0').dividedBy(10 ** 18),
        ),
      };
    },
    fetchSponsorDepositAmountFailure() {
      return;
    },
  },

  extraReducers: {
    'account/logout': (state, action) => {
      state.expectedGrant = 0;
      state.sponsorBond = 0;
      state.sponsorBondReward = { icx: 0, bnUSD: 0 };
    },
  },
});

export const {
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFTreasuryScoreAddressSuccess,
  fetchCPFTreasuryScoreAddressFailure,
  fetchMaintenanceModeRequest,
  fetchMaintenanceModeSuccess,
  fetchMaintenanceModeFailure,
  fetchRemainingSwapAmountRequest,
  fetchRemainingSwapAmountSuccess,
  fetchRemainingSwapAmountFailure,
  fetchCPFRemainingFundRequest,
  fetchCPFRemainingFundSuccess,
  fetchCPFRemainingFundFailure,
  fetchExpectedGrantRequest,
  fetchExpectedGrantSuccess,
  fetchExpectedGrantFailure,
  fetchCPSTreasuryScoreAddressRequest,
  fetchCPSTreasuryScoreAddressSuccess,
  fetchCPSTreasuryScoreAddressFailure,
  claimReward,
  claimSponsorBondReward,
  fetchSponsorBondRequest,
  fetchSponsorBondSuccess,
  fetchSponsorBondFailure,
  fetchbnUSDAddressRequest,
  fetchbnUSDAddressSuccess,
  fetchbnUSDAddressFailure,
  fetchAvailableFundRequest,
  fetchAvailableFundSuccess,
  fetchAvailableFundFailure,
  fetchSponsorDepositAmountRequest,
  fetchSponsorDepositAmountSuccess,
  fetchSponsorDepositAmountFailure,
  fetchPrePaymentAmountRequest,
  fetchPrePaymentAmountSuccess,
  fetchPrePaymentAmountFailure
} = fundSlice.actions;
export default fundSlice.reducer;
