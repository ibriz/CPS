import React from 'react';
import styles from './ProposalInfo.module.css';

const ProposalInfo = () => {
    return (
        <div className = {styles.proposalInfo} style = {{flexGrow: '1'}}>
            <div className = {styles.title}>PROPOSAL SUBMISSIONS START IN</div>
            <div className = {styles.value}><b>12</b> DAYS <b>11</b> HOURS <b>34</b> MINUTES <b>47</b> SECONDS</div>
        </div>
    )
}

export default ProposalInfo;