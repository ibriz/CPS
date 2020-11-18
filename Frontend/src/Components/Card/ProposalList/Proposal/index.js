import React from 'react';
import { Row, Col, Badge, Button } from 'react-bootstrap';
import styles from './Proposal.module.scss';

import ProgressText from '../../../UI/ProgressText';
import ProgressBar from '../../../UI/ProgressBar';
import LowerCardTitle from '../../../UI/LowerCardList/LowerCardTitle';
import LowerCardInfo from '../../../UI/LowerCardList/LowerCardInfo';
import Budget from '../../../UI/LowerCardList/Budget';
import { icxFormat } from 'helpers';
import {proposalStatusMapping} from 'Constants';
import ClassNames from 'classnames';
import {Link} from 'react-router-dom';

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

const Proposal = ({ proposal, selectedTab, onClick, proposalPendingPR = false }) => {
    return (
        <>
            <Row className={styles.proposalContainer} onClick={onClick}>
                <Col sm={proposalPendingPR ? "8" : "9"} className={styles.infos}>
                    <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
                        <Badge size="xs" variant={proposalStatusMapping.find(mapping => mapping.status === proposal._status).badgeColor} className={styles.badge}>{proposalStatusMapping.find(mapping => mapping.status === proposal._status).name}</Badge>{' '}
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
                {
                                    !proposalPendingPR &&
                                    <Col md={proposalPendingPR ? "4" : "3"} xs = "12" className={styles.progressBar} >
                    

                                    {
                                        ["Voting"].includes(proposalStatusMapping.find(mapping => mapping.status === proposal._status).name) &&
                                            <>
            
                                                <ProgressText>{proposal.approvedPercentage ? `${proposal.approvedPercentage.toFixed()}` : 0}% Stake Approved</ProgressText>
                                                <ProgressBar percentage={proposal.approvedPercentage} />
                                            </>
                                    }
            
                                    {
                                        ["Active", "Paused"].includes(proposalStatusMapping.find(mapping => mapping.status === proposal._status).name) && !proposalPendingPR &&
                                            <>
            
                                                <ProgressText>{proposal.completedPercentage ? `${proposal.completedPercentage.toFixed()}` : 0}% Completed</ProgressText>
                                                <ProgressBar percentage={proposal.completedPercentage} />
                                            </>
                                    }
            
            
            
            
              
            
            
                            </Col>
                }

{
                                    proposalPendingPR &&
                                    <Col lg="4" xs = "12" className={ClassNames(styles.progressBar, styles.createProgressReportButtonContainer)} >
            
                                    {
                                        ["Active", "Paused"].includes(proposalStatusMapping.find(mapping => mapping.status === proposal._status).name) && proposalPendingPR &&
                                            <>
                                                <Link to={{
                                                        pathname: "/newProgressReport",
                                                        // search: "?sort=name",
                                                        // hash: "#the-hash",
                                                        ipfsKey: proposal.ipfsKey
                                                    }}>
                                                <Button variant="info" className={styles.createProposalButton} >CREATE NEW PROGRESS REPORT</Button>
                                                </Link>
                                            </>
                                    }
            
            
              
            
            
                            </Col>
                }


            </Row>

            <hr className={styles.horizontalRule} />
        </>
    )
}

export default Proposal;