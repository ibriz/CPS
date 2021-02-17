
import {connect} from 'react-redux';
import {fetchProgressReportListRequest, fetchDraftsRequest} from '../../Redux/Reducers/progressReportSlice';
import {fetchProposalByAddressRequest} from 'Redux/Reducers/proposalSlice';
import Card from './Card';

const mapStateToProps = state => (
    {
        progressReportList: state.progressReport.progressReportList,
        walletAddress: state.account.address,
        totalPages: state.progressReport.totalPages,
        proposalByAddress: state.proposals.proposalByAddress


    }
)

const mapDispatchToProps = dispatch => (
    {
        fetchProgressReport: (payload) => dispatch(fetchProgressReportListRequest(payload)),
        fetchDraftsRequest: payload => dispatch(fetchDraftsRequest(payload)),
        fetchProposalByAddressRequest: payload => dispatch(fetchProposalByAddressRequest(payload))


    }
)

export default connect(mapStateToProps, mapDispatchToProps)(Card);