import React from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import styles from './Proposal.module.scss';
import { useHistory } from 'react-router-dom';
import ProgressText from '../../../UI/ProgressText';
import ProgressBar from '../../../UI/ProgressBar';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { icxFormat } from 'Helpers';
import { proposalStatusMapping } from 'Constants';
import ClassNames from 'classnames';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import useTimer from 'Hooks/useTimer';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import InfoIcon from 'Components/InfoIcon';
import VoteProgressBar from 'Components/VoteProgressBar';

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
  selectedTab,
  onClick,
  proposalPendingPR = false,
  proposalPendingPRSameList = false,
  sponsorRequest = false,
  period,
  minLayout = false,
  showBadge = true,
}) => {
  const { isRemainingTimeZero } = useTimer();
  const history = useHistory();
  if (selectedTab != 'Active') {
    return (
      <>
        <Row className={styles.proposalContainer} onClick={onClick}>
          <Col sm={proposalPendingPR ? '8' : '9'} className={styles.infos}>
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
              {!minLayout && (
                <LowerCardTitle>{proposal._proposal_title}</LowerCardTitle>
              )}
            </Row>

            {minLayout && (
              <Row className={styles.secondRow}>
                <LowerCardTitle>{proposal._proposal_title}</LowerCardTitle>
              </Row>
            )}

            <Row className={styles.secondRow}>
              {minLayout ? (
                <>
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
              ) : (
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

                  {['Active', 'Paused'].includes(
                    proposalStatusMapping.find(
                      mapping => mapping.status === proposal._status,
                    ).name,
                  ) &&
                    proposalPendingPRSameList &&
                    period !== 'VOTING' &&
                    !isRemainingTimeZero && (
                      <>
                        <Link
                          to={{
                            pathname: '/newProgressReport',
                            // search: '?sort=name',
                            // hash: "#the-hash",
                            ipfsKey: proposal.ipfsKey,
                          }}
                        >
                          <Button
                            variant='info'
                            className={styles.createProposalButton}
                          >
                            Create Progress Report
                          </Button>
                        </Link>
                      </>
                    )}
                </>
              )}

              {
                <Col
                  className={ClassNames(
                    styles.progressBar,
                    styles.createProgressReportButtonContainer,
                  )}
                >
                  {['Active', 'Paused'].includes(
                    proposalStatusMapping.find(
                      mapping => mapping.status === proposal._status,
                    ).name,
                  ) &&
                    !proposal?.submitProgressReport && (
                      <>
                        {/* <Link
                          to={{
                            pathname: '/newProgressReport',
                            // search: "?sort=name",
                            // hash: "#the-hash",
                            ipfsKey: proposal.ipfsKey,
                          }}
                        > */}
                        <Button
                          variant='info'
                          className={styles.createProposalButton}
                          onClick={e => {
                            e.stopPropagation();
                            history.push({
                              pathname: '/newProgressReport',
                              ipfsKey: proposal.ipfsKey,
                            });
                          }}
                        >
                          CREATE PROGRESS REPORT
                        </Button>
                        {/* </Link> */}
                      </>
                    )}
                </Col>
              }
            </Row>
          </Col>
          {!proposalPendingPR && (
            <Col
              md={proposalPendingPR ? '4' : '3'}
              xs='12'
              className={styles.progressBar}
            >
              {['Voting'].includes(
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).name,
              ) && (
                <>
                  {/* <ProgressText>{proposal.approvedPercentage ? `${proposal.approvedPercentage.toFixed()}` : 0}% Stake Approved</ProgressText>
                                <ProgressBar percentage={proposal.approvedPercentage} /> */}

                  {/* <ProgressText>Stake- {proposal.approvedPercentage ? proposal.approvedPercentage.toFixed() : 0}% approved, {proposal.rejectedPercentage ? proposal.rejectedPercentage.toFixed() : 0}% rejected</ProgressText>
                                    <InfoIcon description="The category the project falls into" 
                                        placement = "top"/>

                                    <ProgressBarCombined
                                        approvedPercentage={proposal.approvedPercentage}
                                        rejectedPercentage={proposal.rejectedPercentage}
                                    /> */}

                  {!minLayout && (
                    <VoteProgressBar
                      approvedPercentage={proposal.approvedPercentage}
                      rejectedPercentage={proposal.rejectedPercentage}
                      proposal
                    />
                  )}

                  {/* <ProgressText>Voter count- {proposal.approvedVotesPercentageCount ? proposal.approvedVotesPercentageCount.toFixed() : 0}% approved, {proposal.rejectedVotesPercentageCount ? proposal.rejectedVotesPercentageCount.toFixed() : 0}% rejected</ProgressText>
                                    <InfoIcon description="The category the project falls into" 
                                        placement = "top"/>
                                    <ProgressBarCombined
                                        approvedPercentage={proposal.approvedVotesPercentageCount}
                                        rejectedPercentage={proposal.rejectedVotesPercentageCount}
                                    /> */}

                  <VoteProgressBar
                    approvedPercentage={proposal.approvedVotesPercentageCount}
                    rejectedPercentage={proposal.rejectedVotesPercentageCount}
                    proposal
                    voterCount
                  />
                </>
              )}

              {['Active', 'Paused'].includes(
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).name,
              ) &&
                !proposalPendingPR && (
                  <>
                    <ProgressText>
                      {proposal.completedPercentage
                        ? `${proposal.completedPercentage.toFixed()}`
                        : 0}
                      % Completed
                    </ProgressText>
                    <ProgressBar percentage={proposal.completedPercentage} />
                  </>
                )}
            </Col>
          )}
        </Row>

        <hr className={styles.horizontalRule} />
      </>
    );
  } else {
    return (
      <>
        <Row className={styles.proposalContainer} onClick={onClick}>
          <Col sm={proposalPendingPR ? '8' : '9'} className={styles.infos}>
            <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
              <LowerCardTitle>{proposal._proposal_title}</LowerCardTitle>
            </Row>

            <Row className={styles.secondRow}>
              {minLayout ? (
                <Budget>
                  Budget: {icxFormat(proposal.budget)} {proposal.token}
                </Budget>
              ) : (
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

                  {['Active', 'Paused'].includes(
                    proposalStatusMapping.find(
                      mapping => mapping.status === proposal._status,
                    ).name,
                  ) &&
                    proposalPendingPRSameList &&
                    period !== 'VOTING' &&
                    !isRemainingTimeZero && (
                      <>
                        <Link
                          to={{
                            pathname: '/newProgressReport',
                            // search: "?sort=name",
                            // hash: "#the-hash",
                            ipfsKey: proposal.ipfsKey,
                          }}
                        >
                          <Button
                            variant='info'
                            className={styles.createProposalButton}
                          >
                            Create Progress Report
                          </Button>
                        </Link>
                      </>
                    )}
                </>
              )}
            </Row>
          </Col>
          {!proposalPendingPR && (
            <Col
              md={proposalPendingPR ? '4' : '3'}
              xs='12'
              className={styles.progressBar}
            >
              {['Voting'].includes(
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).name,
              ) && (
                <>
                  {/* <ProgressText>{proposal.approvedPercentage ? `${proposal.approvedPercentage.toFixed()}` : 0}% Stake Approved</ProgressText>
                                  <ProgressBar percentage={proposal.approvedPercentage} /> */}

                  {/* <ProgressText>Stake- {proposal.approvedPercentage ? proposal.approvedPercentage.toFixed() : 0}% approved, {proposal.rejectedPercentage ? proposal.rejectedPercentage.toFixed() : 0}% rejected</ProgressText>
                                      <InfoIcon description="The category the project falls into" 
                                          placement = "top"/>
  
                                      <ProgressBarCombined
                                          approvedPercentage={proposal.approvedPercentage}
                                          rejectedPercentage={proposal.rejectedPercentage}
                                      /> */}

                  {!minLayout && (
                    <VoteProgressBar
                      approvedPercentage={proposal.approvedPercentage}
                      rejectedPercentage={proposal.rejectedPercentage}
                      proposal
                    />
                  )}

                  {/* <ProgressText>Voter count- {proposal.approvedVotesPercentageCount ? proposal.approvedVotesPercentageCount.toFixed() : 0}% approved, {proposal.rejectedVotesPercentageCount ? proposal.rejectedVotesPercentageCount.toFixed() : 0}% rejected</ProgressText>
                                      <InfoIcon description="The category the project falls into" 
                                          placement = "top"/>
                                      <ProgressBarCombined
                                          approvedPercentage={proposal.approvedVotesPercentageCount}
                                          rejectedPercentage={proposal.rejectedVotesPercentageCount}
                                      /> */}

                  <VoteProgressBar
                    approvedPercentage={proposal.approvedVotesPercentageCount}
                    rejectedPercentage={proposal.rejectedVotesPercentageCount}
                    proposal
                    voterCount
                  />
                </>
              )}

              {['Active', 'Paused'].includes(
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).name,
              ) &&
                !proposalPendingPR && (
                  <>
                    <ProgressText>
                      {proposal.completedPercentage
                        ? `${proposal.completedPercentage.toFixed()}`
                        : 0}
                      % Completed
                    </ProgressText>
                    <ProgressBar percentage={proposal.completedPercentage} />
                  </>
                )}
            </Col>
          )}

          {proposalPendingPR && (
            <Col
              lg='4'
              xs='12'
              className={ClassNames(
                styles.progressBar,
                styles.createProgressReportButtonContainer,
              )}
            >
              {['Active', 'Paused'].includes(
                proposalStatusMapping.find(
                  mapping => mapping.status === proposal._status,
                ).name,
              ) &&
                proposalPendingPR && (
                  <>
                    <Link
                      to={{
                        pathname: '/newProgressReport',
                        // search: "?sort=name",
                        // hash: "#the-hash",
                        ipfsKey: proposal.ipfsKey,
                      }}
                    >
                      <Button
                        variant='info'
                        className={styles.createProposalButton}
                      >
                        CREATE NEW PROGRESS REPORT
                      </Button>
                    </Link>
                  </>
                )}
            </Col>
          )}
        </Row>

        <hr className={styles.horizontalRule} />
      </>
    );
  }
};

const mapStateToProps = state => ({
  period: state.period.period,
});

export default connect(mapStateToProps)(Proposal);
