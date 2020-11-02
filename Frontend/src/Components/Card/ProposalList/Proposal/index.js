import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import styles from './Proposal.module.scss';

import ProgressText from '../../../UI/ProgressText';
import ProgressBar from '../../../UI/ProgressBar';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { icxFormat } from 'helpers';

const badgeColor = {
    'Voting': 'warning',
    'Pending': 'warning',

    'Active': 'primary',
    'Completed': 'success',
    'Draft': 'info',
    'Disqualified': 'danger',
    'Paused': 'secondary',

    'Approved': 'success',
    'Rejected': 'danger'


}

const Proposal = ({ proposal, selectedTab, onClick }) => {
    return (
        <>
            <Row className={styles.proposalContainer} onClick={onClick}>
                <Col sm="9" className={styles.infos}>
                    <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
                        <Badge size="xs" variant={badgeColor[selectedTab]} className={styles.badge}>{selectedTab}</Badge>{' '}
                        <LowerCardTitle>{proposal._proposal_title}</LowerCardTitle>
                    </Row>
                    <Row className={styles.secondRow}>
                        <LowerCardInfo>{`${proposal._contributor_address.slice(0, 4)}...${proposal._contributor_address.slice(proposal._contributor_address.length - 3)}`}</LowerCardInfo>
                        <LowerCardInfo className={"proposalInfo2"}>Started from: {new Date(proposal._timestamp / 1000).toLocaleDateString()}</LowerCardInfo>
                        <Budget>
                            Budget: {icxFormat(proposal.budget)} ICX
                    </Budget>

                    </Row>

                </Col>

                <Col sm="3" className={styles.progressBar} >
                    

                        {
                            ["Voting"].includes(selectedTab) &&
                                <>

                                    <ProgressText>{proposal.approvedPercentage ? `${proposal.approvedPercentage.toFixed()}` : 0}% Stake Approved</ProgressText>
                                    <ProgressBar percentage={proposal.approvedPercentage} />
                                </>
                        }

                        {
                            ["Active", "Paused"].includes(selectedTab) &&
                                <>

                                    <ProgressText>{proposal.completedPercentage ? `${proposal.completedPercentage.toFixed()}` : 0}% Completed</ProgressText>
                                    <ProgressBar percentage={proposal.completedPercentage} />
                                </>
                        }


  


                </Col>

            </Row>

            <hr className={styles.horizontalRule} />
        </>
    )
}

export default Proposal;