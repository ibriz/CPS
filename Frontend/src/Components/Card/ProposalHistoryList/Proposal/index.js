import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import styles from './Proposal.module.scss';

import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { icxFormat } from 'Helpers';
import { proposalStatusMapping } from 'Constants';

import { connect } from 'react-redux';

const badgeColor = {
  Voting: 'warning',
  Pending: 'warning',

  Active: 'primary',
  Completed: 'success',
  Draft: 'info',
  Disqualified: 'danger',
  Paused: 'secondary',

  Approved: 'success',
  Rejected: 'danger',
};

const Proposal = ({
  proposal,
  onClick,
  sponsorRequest = false,
  showBadge = true,
}) => {
  return (
    <>
      <Row className={styles.proposalContainer} onClick={onClick}>
        <Col sm='9' className={styles.infos}>
          <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
            {showBadge && (
              <Badge
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
              </Badge>
            )}{' '}
            <LowerCardTitle>{proposal._proposal_title}</LowerCardTitle>
          </Row>

          <Row className={styles.secondRow}>
            <>
              <LowerCardInfo>{`${proposal._contributor_address.slice(
                0,
                4,
              )}...${proposal._contributor_address.slice(
                proposal._contributor_address.length - 3,
              )}`}</LowerCardInfo>

              {proposalStatusMapping.find(
                mapping => mapping.status === proposal._status,
              ).name !== 'Draft' && (
                <>
                  <LowerCardInfo className={'proposalInfo2'}>
                    Submitted on:{' '}
                    {new Date(
                      proposal._sponsored_timestamp / 1000,
                    ).toLocaleDateString()}
                  </LowerCardInfo>
                  <Budget>
                    Budget: {icxFormat(proposal.budget)} {proposal.token}
                  </Budget>
                  {sponsorRequest && (
                    <Budget>
                      Sponsor bond: {icxFormat(proposal.budget / 10)}{' '}
                      {proposal.token}
                    </Budget>
                  )}
                </>
              )}
            </>
          </Row>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  period: state.period.period,
});

export default connect(mapStateToProps)(Proposal);
