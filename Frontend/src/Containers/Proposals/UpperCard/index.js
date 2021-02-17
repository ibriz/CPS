import React from 'react';
import styles from './UpperCard.module.scss';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import useTimer from 'Hooks/useTimer';
import { updatePeriod } from 'Redux/Reducers/periodSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';

const UpperCard = ({ numberOfSubmittedProposals, updatePeriod, sponsorRequest, voting, isPrep, isRegistered, projectAmounts }) => {

    const { period, remainingTime, remainingTimeSecond } = useTimer();
    let [periodConfirmationShow, setPeriodConfirmationShow] = React.useState(false);

    let button;
    let text;

    const onClickUpdatePeriod = () => {
        setPeriodConfirmationShow(true);
    }

    if (remainingTimeSecond === 0) {
        button = <Button variant="primary" className={styles.createProposalButton} onClick={onClickUpdatePeriod}>UPDATE PERIOD </Button>
        text = <span className={styles.proposalNumber}>Click button to trigger {period === 'APPLICATION' ? 'Voting' : 'Application'} Period</span>

    } else if (sponsorRequest || voting) {
        text = null;
        button = null;

    } else {
        button = <Link to="/newProposal">

            <Button variant="info" className={styles.createProposalButton}>{period === 'APPLICATION' ? 'CREATE NEW PROPOSAL' : 'CREATE PROPOSAL DRAFT'}</Button>
        </Link>

        // text = <span className={styles.proposalNumber}>{numberOfSubmittedProposals} Proposals submitted</span>
         
        text = <span className={styles.proposalNumber}>{period === 'APPLICATION' ? 'Create a New Proposal' : 'This is voting period. You can still create a proposal draft'}</span>

    } 
    // else {
    //     button = null;
    //     text = null;

    // }

    const remainingTimeText = <>
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
    </>

    const remainingTimeValue = <span className={styles.proposalTitle}><b>{remainingTime.day}</b> DAYS <b>{remainingTime.hour}</b> HOURS <b>{remainingTime.minute}</b> MINUTES <b>{remainingTime.second}</b> SECONDS</span>;



    return (
        <Row>
            <Col>
                <Card className={styles.upperCard}>
                    <Card.Body>

                        <Container className = {styles.desktopContainer}>
                            <Row style = {{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                {remainingTimeText}
                                {text}

                            </Row>

                            <Row style = {{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                {remainingTimeValue}
                                {button}
                            </Row>

                        </Container>

                        <Row  className = {styles.mobileContainer}>
                            <Col xl="6" style={{ alignItems: 'flex-start' }}>

                                {remainingTimeText}
                                {remainingTimeValue}



                            </Col>

                            <Col xl="6" style={{ alignItems: 'flex-start', marginTop: '10px' }}>
                                {text}
                                {
                                    button
                                }

                            </Col>
                        </Row>


                        {/* <Row className={styles.upperCardRow}>
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

                        </Row> */}
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
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals,
        isPrep: state.account.isPrep,
        isRegistered: state.account.isRegistered,

        projectAmounts: state.proposals.projectAmounts

    };
};

const mapDispatchToProps = dispatch => ({
    updatePeriod: payload => dispatch(updatePeriod(payload))
})

export default connect(mapStateToProps, mapDispatchToProps)(UpperCard);