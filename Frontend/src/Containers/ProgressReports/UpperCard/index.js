import React, { useEffect } from 'react';
import styles from './UpperCard.module.scss';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import useTimer from 'Hooks/useTimer';
import { updatePeriod } from 'Redux/Reducers/periodSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { getNewProgressReportInfo } from 'Selectors';
import { fetchProposalByAddressRequest } from 'Redux/Reducers/proposalSlice';
import { FaDraft2Digital } from 'react-icons/fa';

const UpperCard = ({ numberOfSubmittedProposals, updatePeriod, sponsorRequest, voting, isPrep, isRegistered, walletAddress, fetchProposalByAddressRequest, newProgressReportInfo }) => {

    const { period, remainingTime, remainingTimeSecond } = useTimer();
    let [periodConfirmationShow, setPeriodConfirmationShow] = React.useState(false);

    let button;
    let text;

    useEffect(() => {
        fetchProposalByAddressRequest(
            {
                walletAddress
            }
        )
    }, [fetchProposalByAddressRequest, walletAddress]);

    const onClickUpdatePeriod = () => {
        setPeriodConfirmationShow(true);
    }

    // if (remainingTimeSecond === 0) {
    //     button = <Button variant="primary" className={styles.createProposalButton} onClick={onClickUpdatePeriod}>UPDATE PERIOD </Button>
    //     text = <span className={styles.proposalNumber}>Click button to trigger {period === 'APPLICATION' ? 'Voting' : 'Application'} Period</span>

    // } 
    // else 
    if (sponsorRequest || voting) {
        text = null;
        button = null;

    } else {

        if (newProgressReportInfo.totalProgressReportCount === 0) {
            text = <span className={styles.proposalNumber}>You have no active or paused proposal</span>
            button = <span className={styles.proposalNumber}>You need to have active or paused proposal to {period !== 'VOTING' ? 'create new progress report' : 'create progress report draft'}</span>
        }

        else if (newProgressReportInfo.canCreateNewProgressReportCount === 0 && period !== 'VOTING') {
            text = <span className={styles.proposalNumber}>You have created progress report for all of your active or paused proposals.</span>
            button = null
        }


        else {
            button = <Link to="/newProgressReport">

                <Button variant="info" className={styles.createProposalButton}>{period !== 'VOTING' ? 'CREATE NEW PROGRESS REPORT' : 'CREATE PROGRESS REPORT DRAFT'}</Button>
            </Link>
            if (period !== 'VOTING')
            {
                text = <span className={styles.proposalNumber}>You have created progress report for <b>{newProgressReportInfo.totalProgressReportCount - newProgressReportInfo.canCreateNewProgressReportCount}</b> out of <b>{newProgressReportInfo.totalProgressReportCount}</b> active proposals. </span>

            }
            else {
                text = <span className={styles.proposalNumber}> This is voting period. You can still create progress report draft. </span>

            }
        }


    } 
    // else {
    //     button = null;
    //     text = null;

    // }

    const remainingTimeText = <span className={styles.proposalTitle}><b>{(period === 'VOTING') ? 'PROGRESS REPORT SUBMISSION OPENS IN' : 'PROGRESS REPORT SUBMISSION DEADLINE IN'}</b></span>;
    const remainingTimeValue = <span className={styles.proposalTitle}><b>{remainingTime.day}</b> DAYS <b>{remainingTime.hour}</b> HOURS <b>{remainingTime.minute}</b> MINUTES <b>{remainingTime.second}</b> SECONDS</span>;



    return (
        <Row>
            <Col>
                <Card className={styles.upperCard}>
                    <Card.Body>
                        {/* <Row className={styles.upperCardRow}>
                                {remainingTimeText}
                                {text}

                            </Row>
                            <Row className={styles.upperCardRow}>
                                {remainingTimeValue}
                                {button}
                            </Row> */}

                        <Container className={styles.desktopContainer}>
                            <Row style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {remainingTimeText}
                                {text}

                            </Row>

                            <Row style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {remainingTimeValue}
                                {button}
                            </Row>

                        </Container>

                        <Row className={styles.mobileContainer}>
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

const mapStateToProps = () => state => {
    return {
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals,
        isPrep: state.account.isPrep,
        isRegistered: state.account.isRegistered,
        newProgressReportInfo: getNewProgressReportInfo(state),
        walletAddress: state.account.address
    };
};

const mapDispatchToProps = dispatch => ({
    updatePeriod: payload => dispatch(updatePeriod(payload)),
    fetchProposalByAddressRequest: payload => dispatch(fetchProposalByAddressRequest(payload))

})

export default connect(mapStateToProps, mapDispatchToProps)(UpperCard);