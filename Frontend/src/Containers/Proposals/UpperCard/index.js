import React from 'react';
import styles from './UpperCard.module.scss';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import useTimer from 'Hooks/useTimer';
import {updatePeriod} from 'Redux/Reducers/periodSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';

const UpperCard = ({ numberOfSubmittedProposals, updatePeriod, sponsorRequest, voting }) => {

    const { period, remainingTime, remainingTimeSecond } = useTimer();
    let [periodConfirmationShow, setPeriodConfirmationShow] = React.useState(false);

    console.log("remainingTimeSecond", remainingTimeSecond);
    console.log(remainingTimeSecond);

    let button;
    let text;

    const onClickUpdatePeriod = () => {
        setPeriodConfirmationShow(true);
    }

    if (remainingTimeSecond === 0) {
        button = <Button variant="primary" className={styles.createProposalButton} onClick = {onClickUpdatePeriod}>UPDATE PERIOD </Button>
        text = <span className={styles.proposalNumber}>Click button to trigger {period === 'APPLICATION' ? 'Voting' : 'Application'} Period</span>

    } else if (sponsorRequest || voting) {
        text = null;
        button = null;
        
    } else if (period === 'APPLICATION') {
        button = <Link to="/newProposal">

            <Button variant="info" className={styles.createProposalButton}>CREATE NEW PROPOSAL</Button>
        </Link>

        text = <span className={styles.proposalNumber}>{numberOfSubmittedProposals} Proposals submitted</span>

    } else {
        button = null;
        text = null;

    }


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
                            {
                                !voting && !sponsorRequest &&
                                <span className={styles.proposalTitle}><b>{(period === 'VOTING') ? 'PROPOSAL SUBMISSIONS OPENS IN' : 'PROPOSAL SUBMISSION DEADLINE IN'}</b></span>

                            }

                            {
                                (sponsorRequest) &&
                                <span className={styles.proposalTitle}><b>{(period === 'VOTING') ? 'APPLICATION PERIOD STARTS IN' : 'APPLICATION PERIOD ENDS IN'}</b></span>

                            }

                            {
                                (voting) &&
                                <span className={styles.proposalTitle}><b>{(period === 'VOTING') ? 'VOTING PERIOD ENDS IN' : 'VOTING PERIOD STARTS IN'}</b></span>

                            }
                            {text}

                        </Row>
                        <Row className={styles.upperCardRow}>
                            <span className={styles.proposalTitle}><b>{remainingTime.day}</b> DAYS <b>{remainingTime.hour}</b> HOURS <b>{remainingTime.minute}</b> MINUTES <b>{remainingTime.second}</b> SECONDS</span>
                            {
                                button
                            }

                        </Row>
                    </Card.Body>
                </Card>
            </Col>
            
            <ConfirmationModal
                show={periodConfirmationShow}
                onHide={() => setPeriodConfirmationShow(false)}
                heading={'Period Update Confirmation'}
                onConfirm={() => {
                    updatePeriod();
                }} >
                {                 
                        <>
                            <div>Are you sure you want to trigger period update?</div>
                        </> 
                }

            </ConfirmationModal>
        </Row>
    );
}

const mapStateToProps = state => {
    return {
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals
    };
};

const mapDispatchToProps = dispatch => ({
    updatePeriod: payload => dispatch(updatePeriod(payload))
})

export default connect(mapStateToProps, mapDispatchToProps)(UpperCard);