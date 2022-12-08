import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBlock: null,
  nextBlock: null,
  remainingTime: null,
  period: null,
  timestamp: null,
  periodSpan: 0,
  periodCount: 0,
};

const periodMapping = {
  'Application Period': 'APPLICATION',
  'Voting Period': 'VOTING',
};

const periodSlice = createSlice({
  name: 'period',
  initialState,
  reducers: {
    fetchPeriodDetailsRequest() {
      return;
    },
    fetchPeriodDetailsSuccess(state, action) {
      state.currentBlock = parseInt(action.payload.response.current_block);
      state.nextBlock = parseInt(action.payload.response.next_block);
      state.remainingTime = parseInt(action.payload.response.remaining_time);
      state.period = periodMapping[action.payload.response.period_name];
      state.previousPeriod =
        periodMapping[action.payload.response.previous_period_name];
      state.periodSpan = parseInt(action.payload.response.period_span);
      state.timestamp = Math.floor(Date.now() / 1000);

      return;
    },
    fetchPeriodDetailsFailure() {
      return;
    },

    fetchPeriodCountRequest() {
      return;
    },
    fetchPeriodCountSuccess(state, action) {
      state.periodCount = parseInt(action.payload.response);
      return;
    },
    fetchPeriodCountFailure() {
      return;
    },

    updatePeriod() {
      return;
    },
    updatePeriodFrontendWallet() {
      return;
    },
  },
});

export const {
  fetchPeriodDetailsRequest,
  fetchPeriodDetailsSuccess,
  fetchPeriodDetailsFailure,
  fetchPeriodCountRequest,
  fetchPeriodCountSuccess,
  fetchPeriodCountFailure,
  updatePeriod,
  updatePeriodFrontendWallet,
} = periodSlice.actions;
export default periodSlice.reducer;
