import React from 'react';
import styles from './ProposalInfo.module.css';

const ProposalIntro = () => {
  return (
    <div className={styles.proposalIntro}>
      <span style={{ fontWeight: 600 }}>
        Welcome to the Contribution Proposal System.
      </span>{' '}
      <div style={{ marginTop: '15px' }}>
        {' '}
        The CPS is part of the ICON Republic DAO governance. The CPS supports
        worthy projects through grants from the Contribution Proposal Fund
        (CPF), which grows through the daily accumulation of block rewards.
        Learn how to submit a proposal and get paid to contribute to the ICON
        DAO by working on infrastructure, development, or community activities.
      </div>
      <div style={{ marginTop: '15px' }}>
        Discuss proposal ideas on the{' '}
        <a
          href='https://forum.icon.community/c/contribution-proposals/45'
          target='_blank'
          style={{ color: 'white', textDecoration: 'underline' }}
        >
          ICON Forum
        </a>
      </div>
    </div>
  );
};

export default ProposalIntro;
