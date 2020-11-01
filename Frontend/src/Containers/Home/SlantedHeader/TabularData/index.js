import React, { useEffect, useState } from 'react';
import styles from './TabularData.module.css';
import { connect } from 'react-redux';
import { fetchProposalListRequest, fetchProjectAmountsRequest } from 'Redux/Reducers/proposalSlice';
import wallet from 'Redux/ICON/FrontEndWallet';
import {fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest} from 'Redux/Reducers/fundSlice';
import {icxFormat} from 'helpers';

const TabularData = ({ numberOfPendingProposals, numberOfSubmittedProposals, totalPendingProposalBudge, totalSubmittedProposalBudget, cpfRemainingFunds, numberOfApprovedProposals, totalApprovedProposalBudget, fetchProposalListRequest, walletAddress,totalCount, fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest, cpfScoreAddress, fetchProjectAmountsRequest, projectAmounts }) => {

    useEffect(() => {
        fetchCPFScoreAddressRequest();
        fetchProjectAmountsRequest();
    }, [fetchCPFScoreAddressRequest, fetchProjectAmountsRequest]);

    useEffect(() => {
        fetchCPFRemainingFundRequest();
    }, [fetchCPFRemainingFundRequest, cpfScoreAddress])

    const tabularData = [
        {
            key: 'Voting Proposals',
            value: `${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`
        },
        {
            key: 'Approved Proposals',
            value: `${projectAmounts.Active.count} (${icxFormat(projectAmounts.Active.amount)} ICX)`
        },
        {
            key: 'CPF Remaining Funds',
            value: `${icxFormat(cpfRemainingFunds, true)} ICX`
        }
    ];

    useEffect(() => {
        fetchProposalListRequest(
            {
                status: "Voting",
                walletAddress: walletAddress || wallet.getAddress(),
                pageNumber: 1
            }
        );
    }, [])

    return (
        <div className = {styles.tabular}>
            {
                tabularData.map((data, index) => (
                    <div className={styles.tableRow} style = {index === 0 ? {marginTop: 0} : {}} key = {data.key}>
                        <span className={styles.key}>{data.key}</span>
                        <span className={styles.value}>{data.value}</span>
                    </div>

                ))
            }
        </div>
    )
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

        projectAmounts: state.proposals.projectAmounts



    };
};

const mapDispatchToProps = dispatch => (
    {
        fetchProposalListRequest: (payload) => dispatch(fetchProposalListRequest(payload)),
        fetchCPFScoreAddressRequest: payload => dispatch(fetchCPFScoreAddressRequest(payload)),
        fetchCPFRemainingFundRequest: payload => dispatch(fetchCPFRemainingFundRequest(payload)),
        fetchProjectAmountsRequest: payload => dispatch(fetchProjectAmountsRequest(payload)),
    }
)

export default connect(mapStateToProps, mapDispatchToProps)(TabularData);

