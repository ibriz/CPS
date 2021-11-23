import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
    fetchProposalListRequest,
    fetchProjectAmountsRequest,
} from 'Redux/Reducers/proposalSlice';
import { fetchPrepsRequest } from 'Redux/Reducers/prepsSlice';
import {
    fetchCPFScoreAddressRequest,
    fetchCPFRemainingFundRequest,
} from 'Redux/Reducers/fundSlice';
import { icxFormat } from 'Helpers';
var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

function abbreviateNumber(number) {

    // what tier? (determines SI symbol)
    var tier = Math.log10(Math.abs(number)) / 3 | 0;

    // if zero, we don't need a suffix
    if (tier == 0) return number;

    // get suffix and determine scale
    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(1) + suffix;
}
const Summary = ({
    numberOfPendingProposals,
    numberOfSubmittedProposals,
    totalPendingProposalBudge,
    totalSubmittedProposalBudget,
    cpfRemainingFunds,
    numberOfApprovedProposals,
    totalApprovedProposalBudget,
    fetchProposalListRequest,
    walletAddress,
    totalCount,
    fetchCPFScoreAddressRequest,
    fetchCPFRemainingFundRequest,
    cpfScoreAddress,
    fetchProjectAmountsRequest,
    projectAmounts,
    fetchPrepsRequest,
    preps,
}) => {

    useEffect(() => {
        fetchCPFScoreAddressRequest();
        fetchProjectAmountsRequest();
        fetchPrepsRequest();
    }, [
        fetchCPFScoreAddressRequest,
        fetchProjectAmountsRequest,
        fetchPrepsRequest,
    ]);

    useEffect(() => {
        fetchCPFRemainingFundRequest();
    }, [fetchCPFRemainingFundRequest, cpfScoreAddress]);


    return (<div className="landingPage__Summary">
        <div className="description">
            <div>
                <p>{totalCount.Active}</p>
                <p>Active Projects</p>
            </div>
            <div>
                <p>{totalCount.Completed}</p>
                <p>Projects Completed</p>
            </div>
            <div>
                <p>{abbreviateNumber(!isNaN(cpfRemainingFunds.icx) ? cpfRemainingFunds.icx : 0)}<br /></p>
                <p>ICX Treasury Value</p>
            </div>
            <div>
                <p>{abbreviateNumber(!isNaN(cpfRemainingFunds.bnUSD) ? cpfRemainingFunds.bnUSD : 0)}<br /></p>
                <p>bnUSD Treasury Value</p>
            </div>
            <div>
                <p> {abbreviateNumber(projectAmounts.Active.amount.icx || 0 + projectAmounts.Paused.amount.icx || 0)}<br /> </p>
                <p>ICX Given Out</p>
            </div>
            <div>
                <p> {abbreviateNumber(projectAmounts.Active.amount.bnUSD || 0 + projectAmounts.Paused.amount.bnUSD || 0)}<br /></p>
                <p>bnUSD Given Out</p>
            </div>
        </div>
    </div>)
}

const mapStateToProps = () => state => {
    return {
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals,
        totalSubmittedProposalBudget: state.proposals.totalSubmittedProposalBudget,

        numberOfPendingProposals: state.proposals.numberOfPendingProposals,
        totalPendingProposalBudge: state.proposals.totalPendingProposalBudge,

        numberOfApprovedProposals: state.proposals.numberOfApprovedProposals,
        totalApprovedProposalBudget: state.proposals.totalApprovedProposalBudget,

        cpfRemainingFunds: state.fund.cpfRemainingFunds,
        cpfScoreAddress: state.fund.cpfScoreAddress,

        walletAddress: state.account.address,
        totalCount: state.proposals.totalCount,

        projectAmounts: state.proposals.projectAmounts,
        preps: state.preps.preps,
    };
};

const mapDispatchToProps = dispatch => ({
    fetchProposalListRequest: payload =>
        dispatch(fetchProposalListRequest(payload)),
    fetchCPFScoreAddressRequest: payload =>
        dispatch(fetchCPFScoreAddressRequest(payload)),
    fetchCPFRemainingFundRequest: payload =>
        dispatch(fetchCPFRemainingFundRequest(payload)),
    fetchProjectAmountsRequest: payload =>
        dispatch(fetchProjectAmountsRequest(payload)),
    fetchPrepsRequest: payload => dispatch(fetchPrepsRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Summary);