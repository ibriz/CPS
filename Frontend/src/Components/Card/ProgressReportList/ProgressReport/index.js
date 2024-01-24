import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import styles from './Proposal.module.scss';

import ProgressText from '../../../UI/ProgressText';
import ProgressBar from '../../../UI/ProgressBar';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { progressReportStatusMapping } from 'Constants';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import ClassNames from 'classnames';
import VoteProgressBar from 'Components/VoteProgressBar';

const badgeColor = {
  Approved: 'success',
  Voting: 'warning',
  Rejected: 'danger',
  Draft: 'info',
};

const ProgressReport = ({
  progressReport,
  selectedTab,
  showProject = true,
  onClick,
  isModal = false,
  minLayout = false,
  showBadge = true,
}) => {
  return (
    <>
      <Row className={styles.proposalContainer} onClick={onClick}>
        <Col
          sm='9'
          className={ClassNames(styles.infos, { [styles.infosModal]: isModal })}
        >
          <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
            {showBadge && (
              <Badge
                size='xs'
                variant={
                  progressReportStatusMapping.find(
                    mapping => mapping.status === progressReport.status,
                  ).badgeColor
                }
                className={styles.badge}
              >
                {
                  progressReportStatusMapping.find(
                    mapping => mapping.status === progressReport.status,
                  ).name
                }
              </Badge>
            )}{' '}
            <LowerCardTitle>
              {progressReport.progressReportTitle}
            </LowerCardTitle>
          </Row>
          {!minLayout && (
            <Row className={styles.secondRow}>
              <>
                {showProject && (
                  <Budget>Project: {progressReport.projectTitle}</Budget>
                )}

                {progressReportStatusMapping.find(
                  mapping => mapping.status === progressReport.status,
                ).name !== 'Draft' && (
                  <LowerCardInfo className={'proposalInfo2'}>
                    Submitted on:{' '}
                    {new Date(
                      progressReport.timestamp / 1000,
                    ).toLocaleDateString()}
                  </LowerCardInfo>
                )}
              </>
            </Row>
          )}
          {minLayout && (
            <Row className={styles.secondRow}>
              {showProject && (
                <Budget>Project: {progressReport.projectTitle}</Budget>
              )}
            </Row>
          )}
        </Col>

        {progressReportStatusMapping.find(
          mapping => mapping.status === progressReport.status,
        ).name !== 'Draft' && (
          <Col
            md='3'
            xs='12'
            className={ClassNames(styles.progressBar, {
              [styles.progressBarModal]: isModal,
            })}
          >

            {!minLayout && (
              <VoteProgressBar
                approvedPercentage={progressReport.approvedPercentage}
                rejectedPercentage={progressReport.rejectedPercentage}
              />
            )}

            {/* <VoteProgressBar
              approvedPercentage={progressReport.approvedVotesPercentageCount}
              rejectedPercentage={progressReport.rejectedVotesPercentageCount}
              voterCount
            /> */}
          </Col>
        )}

      </Row>
      <hr className={styles.horizontalRule} />
    </>
  );
};

export default ProgressReport;
