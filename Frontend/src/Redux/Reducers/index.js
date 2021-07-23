import { combineReducers } from "redux";
import proposalsReducer from "./proposalSlice";
import accountReducer from "./accountSlice";
import progressReportReducer from "./progressReportSlice";
import prepsSlice from "./prepsSlice";
import periodSlice from "./periodSlice";
import fundSlice from "./fundSlice";
import userSlice from "./userSlice";

const rootReducer = combineReducers({
  proposals: proposalsReducer,
  account: accountReducer,
  progressReport: progressReportReducer,
  preps: prepsSlice,
  period: periodSlice,
  fund: fundSlice,
  user: userSlice,
});

export default rootReducer;
