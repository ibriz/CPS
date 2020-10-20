import React from 'react';
import styles from './TabularData.module.css';
import { connect } from 'react-redux';


const TabularData = ({ numberOfPendingProposals, numberOfSubmittedProposals, totalPendingProposalBudge, totalSubmittedProposalBudget, cpfRemainingFunds, numberOfApprovedProposals, totalApprovedProposalBudget }) => {

    const tabularData = [
        {
            key: 'Pending Proposals',
            value: `${numberOfPendingProposals} (${totalPendingProposalBudge} ICX)`
        },
        {
            key: 'Approved Proposals',
            value: `${numberOfApprovedProposals} (${totalApprovedProposalBudget} ICX)`
        },
        {
            key: 'CPF Remaining Funds',
            value: `${cpfRemainingFunds} ICX`
        }
    ];

    return (
        <div className = {styles.tabular}>
            {
                tabularData.map((data, index) => (
                    <div className={styles.tableRow} style = {index === 0 ? {marginTop: 0} : {}}>
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


    };
};

export default connect(mapStateToProps)(TabularData);

