import { combineReducers } from 'redux';
import proposalsReducer from './proposalSlice';
import accountReducer from './accountSlice';
import progressReportReducer from './progressReportSlice';
import prepsSlice from './prepsSlice';
import periodSlice from './periodSlice';

const rootReducer = combineReducers({
    proposals: proposalsReducer,
    account: accountReducer,
    progressReport: progressReportReducer,
    preps: prepsSlice,
    period: periodSlice
});

export default rootReducer;