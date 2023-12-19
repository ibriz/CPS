import { createSlice } from '@reduxjs/toolkit';

const initialState = {
outstandingVotes: 0,
};

const miscSlice = createSlice({
  name: 'misc',
  initialState,
  reducers: {
    setOutstandingVotes(state, action) {
      state.outstandingVotes = action.payload.outstandingVotes;
    }
  }
});

export const {
    setOutstandingVotes
} = miscSlice.actions;
export default miscSlice.reducer;
