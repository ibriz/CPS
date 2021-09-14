import { connect } from 'react-redux';
import React from 'react';
import { Container } from 'react-bootstrap';
// import { fetchProgressReportListRequest } from '../../Redux/Reducers/progressReportSlice';
import ProgressReport from '../../ProgressReportList/ProgressReport';
import styles from './ProgressReportList.module.css';
import { progressReportStatusMapping } from '../../../../Constants';

const ProgressReportList = ({ projectReports }) => {
  return (
    <Container fluid>
      {projectReports.length ? (
        projectReports.map((progressReport, index) => (
          <ProgressReport
            key={index}
            progressReport={progressReport}
            selectedTab={
              progressReportStatusMapping.find(mapping => {
                return mapping.status === progressReport.status;
              })?.name
            }
            showProject={false}
          />
        ))
      ) : (
        <span className={styles.noProposals}>
          No Progress Report for this project
        </span>
      )}
    </Container>
  );
};

const mapStateToProps = state => ({
  // projectReports: []
});

const mapDispatchToProps = dispatch => ({
  // fetchProgressReport: () => dispatch(fetchProgressReportListRequest())
});

export default connect(mapStateToProps, mapDispatchToProps)(ProgressReportList);
