import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    preps: []
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
                if (typeof (prep) === "string")
                    return {
                        address: prep,
                        name: prep
                    }
                else

                    return {
                        name: prep.name,
                        address: prep.address
                    }

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
    },
})

export const { fetchPrepsRequest, fetchPrepsSuccess, fetchPrepsFailure, unregisterPrep, registerPrep, payPenalty
} = prepsSlice.actions;
export default prepsSlice.reducer;