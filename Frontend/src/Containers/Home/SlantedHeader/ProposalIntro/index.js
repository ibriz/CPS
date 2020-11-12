import React from 'react';
import styles from './ProposalInfo.module.css';

const ProposalIntro = () => {
    return (
        <div className = {styles.proposalIntro}>
            <span style = {{fontWeight: 600}}>Welcome to the Contribution Proposal System.</span> <span> The CPS is part of the ICON Republic DAO governance. The CPS manages funds from block rewards through grants to worthy projects. Learn how to submit a proposal and get paid to contribute to the ICON DAO by working on infrastructure, development, or community activities</span>
        </div>
    )
}

export default ProposalIntro;