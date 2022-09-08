import React from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import styles from './Proposal.module.scss';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { icxFormat } from 'Helpers';
import { proposalStatusMapping } from 'Constants';

const Proposal = ({
  proposal,
  onClick,
  proposalPendingPR = false,
  priorityVoteList,
}) => {
  return (
    <>
      <Row
        style={
          priorityVoteList.includes(proposal.ipfsHash)
            ? { background: '#eee' }
            : { background: 'white' }
        }
        className={styles.proposalContainer}
        onClick={onClick}
      >
        <Col sm={proposalPendingPR ? '8' : '9'} className={styles.infos}>
          <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
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
            <LowerCardTitle>{proposal._proposal_title}</LowerCardTitle>
          </Row>
          <Row className={styles.secondRow}>
            {/* <LowerCardInfo>{`${proposal._contributor_address.slice(
              0,
              4,
            )}...${proposal._contributor_address.slice(
              proposal._contributor_address.length - 3,
            )}`}</LowerCardInfo> */}

            {proposalStatusMapping.find(
              mapping => mapping.status === proposal._status,
            ).name !== 'Draft' && (
              <>
                {/* <LowerCardInfo className={'proposalInfo2'}>
                  Submitted on:{' '}
                  {new Date(
                    proposal._sponsored_timestamp / 1000,
                  ).toLocaleDateString()}
                </LowerCardInfo> */}
                <Budget>
                  Budget: {icxFormat(proposal.budget)} {proposal.token}
                </Budget>
              </>
            )}
          </Row>
        </Col>
        {priorityVoteList.indexOf(proposal.ipfsHash) != -1 && (
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
        )}
      </Row>

      <hr className={styles.horizontalRule} />
    </>
  );
};

export default Proposal;
