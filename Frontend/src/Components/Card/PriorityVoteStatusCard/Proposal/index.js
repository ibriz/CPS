import React from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import styles from './Proposal.module.scss';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { icxFormat } from 'Helpers';
import { proposalStatusMapping } from 'Constants';
import { useSelector } from 'react-redux';

const Proposal = ({ proposal, index }) => {
  const isDarkTheme = localStorage.getItem('theme') === 'dark';
  // const isDark = useSelector(state => state.theme.isDark);
  return (
    <>
      <Row
        style={{ background: isDarkTheme ? '#242425' : 'white' }}
        className={styles.proposalContainer}
      >
        <Row
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '15px',
            paddingRight: '15px',
          }}
          className={styles.firstRow}
        >
          {/* <Badge
              size='xs'
              variant={
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).badgeColor
              }
              className={styles.badge}
            >
              {
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).name
              }
            </Badge>{' '} */}
          <LowerCardTitle>
            {'  '} {index + 1}. {proposal._proposal_title}
          </LowerCardTitle>
          <Budget>
            {icxFormat(proposal.budget)} {proposal.token}
          </Budget>
        </Row>
        {/* {priorityVoteList.indexOf(proposal.ipfsHash) != -1 && (
          <Col sm={proposalPendingPR ? '4' : '3'} style={{ textAlign: 'end' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#007bff',
                color: 'white',
                width: 50,
                height: 50,
                borderRadius: '50%',
                margin: '0 auto',
              }}
            >
              {priorityVoteList.indexOf(proposal.ipfsHash) + 1}
            </div>
          </Col>
        )} */}
      </Row>

      <hr className={styles.horizontalRule} />
    </>
  );
};

export default Proposal;
