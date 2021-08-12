import { connect } from 'react-redux';
import {
  fetchProgressReportListRequest,
  fetchDraftsRequest,
  fetchProgressReportByIpfsRequest,
  emptyProgressReportDetailRequest,
} from "../../Redux/Reducers/progressReportSlice";
import { fetchProposalByAddressRequest } from "Redux/Reducers/proposalSlice";
import Card from "./Card";

const mapStateToProps = state => ({
  progressReportList: state.progressReport.progressReportList,
  walletAddress: state.account.address,
  totalPages: state.progressReport.totalPages,
  proposalByAddress: state.proposals.proposalByAddress,
  selectedProgressReportByIpfs: state.progressReport.selectedProgressReport,
});

const mapDispatchToProps = dispatch => ({
  fetchProgressReport: payload =>
    dispatch(fetchProgressReportListRequest(payload)),
  fetchDraftsRequest: payload => dispatch(fetchDraftsRequest(payload)),
  fetchProposalByAddressRequest: payload =>
    dispatch(fetchProposalByAddressRequest(payload)),
  fetchProgressReportByIpfsRequest: (payload) =>
    dispatch(fetchProgressReportByIpfsRequest(payload)),
  emptyProgressReportDetailRequest: (payload) =>
    dispatch(emptyProgressReportDetailRequest()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Card);
