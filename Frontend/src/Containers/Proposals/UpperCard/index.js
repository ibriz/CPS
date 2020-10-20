import React from 'react';
import styles from './UpperCard.module.scss';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import useTimer from 'Hooks/useTimer'

const UpperCard = ({ numberOfSubmittedProposals }) => {

    const {period, remainingTime} = useTimer();
    return (
        <Row>
            <Col>
                <Card className={styles.upperCard}>
                    <Card.Body>
                        {/* <Row>
                            <Col lg="10">
                                <Row>
                                    <span className={styles.proposalTitle}><b>PROPOSAL SUBMISSIONS OPEN</b></span>
                                </Row>

                                <Row>
                                    <span className={styles.proposalTitle}><b>12</b> DAYS <b>14</b> HOURS <b>11</b> MINUTES 20 SECONDS</span>
                                </Row>

                            </Col>

                            <Col lg="6">
                                <Row>
                                    <span className={styles.proposalNumber}>{numberOfSubmittedProposals} Proposals submitted</span>
                                </Row>

                                <Row>
                                    <Link to="/newProposal">
                                        <Button variant="info" className={styles.createProposalButton}>CREATE NEW PROPOSAL</Button>
                                    </Link>                            </Row>

                            </Col>

                        </Row> */}


                        <Row className={styles.upperCardRow}>
                            <span className={styles.proposalTitle}><b>{(period === 'VOTING') ? 'PROPOSAL SUBMISSIONS OPENS IN' : 'PROPOSAL SUBMISSION DEADLINE IN'}</b></span>
                            <span className={styles.proposalNumber}>{numberOfSubmittedProposals} Proposals submitted</span>

                        </Row>
                        <Row className={styles.upperCardRow}>
                            <span className={styles.proposalTitle}><b>{remainingTime.day}</b> DAYS <b>{remainingTime.hour}</b> HOURS <b>{remainingTime.minute}</b> MINUTES <b>{remainingTime.second}</b> SECONDS</span>
                            <Link to="/newProposal">
                                <Button variant="info" className={styles.createProposalButton}>CREATE NEW PROPOSAL</Button>
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