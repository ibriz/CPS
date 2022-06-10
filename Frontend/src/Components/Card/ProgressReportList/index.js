import React from 'react';
import styles from './ProposalList.module.scss';
import { Container } from 'react-bootstrap';
import ProgressReport from './ProgressReport';
import ProgressReportInProposal from './ProgressReportInProposal';

const ProjectReportList = ({
  projectReports,
  selectedTab,
  onClickProgressReport,
  isModal = false,
  minHeight = '100px',
  isInsideProposal = false,
  minLayout = false,
}) => {
  return (
    <Container
      fluid
      style={
        projectReports.length
          ? {}
          : {
              minHeight: minHeight,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }
      }
    >
      {projectReports.length ? (
        projectReports.map(progressReport =>
          !isInsideProposal ? (
            <ProgressReport
              // key = {progressReport.reportKey}
              progressReport={progressReport}
              selectedTab={selectedTab}
              onClick={() => onClickProgressReport(progressReport)}
              isModal={isModal}
              minLayout={minLayout}
            />
          ) : (
            <ProgressReportInProposal
              // key = {progressReport.reportKey}
              progressReport={progressReport}
              selectedTab={selectedTab}
              onClick={() => onClickProgressReport(progressReport)}
              isModal={isModal}
            />
          ),
        )
      ) : (
        <span className={styles.noProposals}>
          No {selectedTab} Progress Report
        </span>
      )}
    </Container>
  );
};

export default ProjectReportList;
