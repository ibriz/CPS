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

const ProgressReportInProposal = ({
  progressReport,
  selectedTab,
  showProject = true,
  onClick,
  isModal = false,
}) => {
  return (
    <>
      <Row className={styles.proposalContainer} onClick={onClick}>
        <Col
          sm='9'
          className={ClassNames(styles.infos, { [styles.infosModal]: isModal })}
        >
          <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
            <LowerCardTitle>
              {progressReport.progressReportTitle}
            </LowerCardTitle>
          </Row>
          <Row className={styles.secondRow}>
            {/* {showProject && (
              <Budget>Project: {progressReport.projectTitle}</Budget>
            )} */}

            {progressReportStatusMapping.find(
              mapping => mapping.status === progressReport.status,
            ).name !== 'Draft' && (
              <LowerCardInfo className={'proposalInfo2'}>
                Submitted on:{' '}
                {new Date(progressReport.timestamp / 1000).toLocaleDateString()}
              </LowerCardInfo>
            )}
          </Row>
        </Col>

        <Col
          lg='3'
          xs='12'
          style={{ alignItems: 'center', justifyContent: 'center' }}
          className={styles.firstRow}
        >
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
          </Badge>{' '}
        </Col>

        {/* {
                    progressReportStatusMapping.find(mapping => mapping.status === progressReport.status).name !== 'Draft' && progressReportStatusMapping.find(mapping => mapping.status === progressReport.status).name === 'Rejected' && progressReport.approvedVotesPercentageCount > progressReport.approvedPercentage &&
                    <Col md="3" xs="12" className={styles.progressBar} >
                        <ProgressText>{progressReport.approvedPercentage ? progressReport.approvedPercentage.toFixed() : 0}% Stake Approved</ProgressText>
                        <ProgressBar percentage={progressReport.approvedPercentage} />
                    </Col>
                }

                {
                    progressReportStatusMapping.find(mapping => mapping.status === progressReport.status).name !== 'Draft' && progressReportStatusMapping.find(mapping => mapping.status === progressReport.status).name === 'Rejected' && progressReport.approvedPercentage >= progressReport.approvedVotesPercentageCount &&
                    <Col md="3" xs="12" className={styles.progressBar} >
                        <ProgressText>{progressReport.approvedVotesPercentageCount ? progressReport.approvedVotesPercentageCount.toFixed() : 0}% Voter Count Approved</ProgressText>
                        <ProgressBar percentage={progressReport.approvedVotesPercentageCount} />
                    </Col>
                } */}
      </Row>
      <hr className={styles.horizontalRule} />
    </>
  );
};

export default ProgressReportInProposal;
