import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import styles from './Proposal.module.scss';

import ProgressText from '../../../UI/ProgressText';
import ProgressBar from '../../../UI/ProgressBar';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';

const badgeColor = {
    'Approved': 'success',
    'Voting': 'warning',
    'Rejected': 'danger',
    'Draft': 'info',

}


const ProgressReport = ({ progressReport, selectedTab, showProject = true, onClick }) => {
    return (
        <>
            <Row className={styles.proposalContainer} onClick = {onClick}>
                <Col sm="9" className={styles.infos}>
                    <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
                        <Badge size="xs" variant={badgeColor[selectedTab]} className={styles.badge}>{selectedTab}</Badge>{' '}
                        <LowerCardTitle>{progressReport.progressReportTitle}</LowerCardTitle>
                    </Row>
                    <Row className={styles.secondRow}>
                        {
                            showProject && (
                                <Budget>
                                    Project: {progressReport.projectTitle}
                                </Budget>
                            )
                        }

                        <LowerCardInfo className={"proposalInfo2"}>Started from: {new Date(progressReport.timestamp / 1000).toLocaleDateString()}</LowerCardInfo>


                    </Row>
                </Col>

                <Col sm="3" className={styles.progressBar} >
                    <ProgressText>{progressReport.approvedPercentage ?? 0}% Approved</ProgressText>
                    <ProgressBar percentage = {progressReport.approvedPercentage} />
                </Col>
            </Row>
            <hr className={styles.horizontalRule} />
        </>
    )
}

export default ProgressReport;