import React from 'react';
import styles from './UpperCard.module.scss';
import { Row, Col, Card, Button } from 'react-bootstrap';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import useTimer from 'Hooks/useTimer';

const UpperCard = ({numberOfSubmittedProposals}) => {

    const {period, remainingTime} = useTimer();

    return (
        <Row>
                <Col>
                    <Card className = {styles.upperCard}>
                        <Card.Body>
                            <Row className={styles.upperCardRow}>
                                <span className={styles.proposalTitle}><b>{(period === 'APPLICATION') ? 'PROGRESS REPORT SUBMISSION OPENS IN' : 'PROGRESS REPORT SUBMISSION DEADLINE IN'}</b></span>
                                <span className={styles.proposalNumber}>{numberOfSubmittedProposals} Progress Reports submitted</span>

                            </Row>
                            <Row className={styles.upperCardRow}>
                                <span className={styles.proposalTitle}><b>{remainingTime.day}</b> DAYS <b>{remainingTime.hour}</b> HOURS <b>{remainingTime.minute}</b> MINUTES <b>{remainingTime.second}</b> SECONDS</span>
                                <Link to="/newProgressReport">
                                <Button variant="info" className = {styles.createProposalButton}>CREATE NEW PROGRESS REPORT</Button>
                                </Link>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

            </Row>
    );
}

const mapStateToProps = () => state => {
    return {
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals
    };
};

export default connect(mapStateToProps)(UpperCard);