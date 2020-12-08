import React from 'react';
import styles from './ProposalList.module.scss';
import { Container} from 'react-bootstrap';
import ProgressReport from './ProgressReport';

const ProjectReportList = ({projectReports, selectedTab, onClickProgressReport}) => {
    return (
        <Container fluid>
            {
                projectReports.length ? projectReports.map((progressReport) =>
                    <ProgressReport 
                        // key = {progressReport.reportKey}
                        progressReport = {progressReport}
                        selectedTab = {selectedTab}
                        onClick={() => onClickProgressReport(progressReport)}

                        />

                ) : <span className = {styles.noProposals}>No {selectedTab} Progress Report</span>
            }

        </Container>
    )
}

export default ProjectReportList;