import React, { useEffect } from 'react';
import styles from './TabularData.module.css';
import { connect } from 'react-redux';
import { fetchProposalListRequest, fetchDraftsRequest } from 'Redux/Reducers/proposalSlice';
import wallet from 'Redux/ICON/FrontEndWallet'

const TabularData = ({ numberOfPendingProposals, numberOfSubmittedProposals, totalPendingProposalBudge, totalSubmittedProposalBudget, cpfRemainingFunds, numberOfApprovedProposals, totalApprovedProposalBudget, fetchProposalListRequest, walletAddress,totalCount }) => {

    const tabularData = [
        {
            key: 'Voting Proposals',
            value: `${totalCount.Voting} (${0} ICX)`
        },
        {
            key: 'Approved Proposals',
            value: `${totalCount.Active} (${totalApprovedProposalBudget} ICX)`
        },
        {
            key: 'CPF Remaining Funds',
            value: `${cpfRemainingFunds} ICX`
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

        cpfRemainingFunds: state.proposals.cpfRemainingFunds,

        walletAddress: state.account.address,
        totalCount: state.proposals.totalCount



    };
};

const mapDispatchToProps = dispatch => (
    {
        fetchProposalListRequest: (payload) => dispatch(fetchProposalListRequest(payload)),
    }
)

export default connect(mapStateToProps, mapDispatchToProps)(TabularData);

