import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    currentBlock: null,
    nextBlock: null,
    remainingTime: null,
    period: null,
    timestamp: null,
};

const periodMapping = {
    'Application Period': 'APPLICATION',
    'Voting Period': 'VOTING'
}

const periodSlice = createSlice({
    name: 'period',
    initialState,
    reducers: {

        fetchPeriodDetailsRequest() {
            return;
        },
        fetchPeriodDetailsSuccess(state, action) {
            state.currentBlock = action.payload.response._current_block;
            state.nextBlock = action.payload.response._next_block;
            state.remainingTime = action.payload.response._remaining_time;
            state.period = periodMapping[action.payload.response._period];
            state.timestamp = Math.floor(Date.now() / 1000);

            return;
        },
        fetchPeriodDetailsFailure() {
            return;
        },
    },
})

export const { fetchPeriodDetailsRequest, fetchPeriodDetailsSuccess, fetchPeriodDetailsFailure,
} = periodSlice.actions;
export default periodSlice.reducer;