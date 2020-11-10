import React, { useState } from 'react';
import Header from '../../Components/Header';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { payPenalty } from 'Redux/Reducers/prepsSlice';
import { payPenaltyAmount } from 'Constants';
import { connect } from 'react-redux';
import useTimer from 'Hooks/useTimer';

const Dashboard = ({ payPenaltyRequest, payPenalty, period }) => {
    const [showPayPenaltyConfirmationModal, setShowPayPenaltyConfirmationModal] = useState(false);
    const {isRemainingTimeZero} = useTimer();

    return (
        <Container>
            <Header title="Dashboard" />
            {
                payPenalty &&
                <Row style={{ marginTop: '15px' }}>
                    <Col xs="12">
                        <Alert variant="danger">
                            {
                                period === 'APPLICATION' && !isRemainingTimeZero ? 
                                `You have been denyListed. You need to pay the penalty amount of ${payPenaltyAmount} ICX to re-register.` :
                                `You have been denyListed. You can pay the penalty amount of ${payPenaltyAmount} ICX in the next Application period to re-register.`
                            }
                            
                            {
                               period === 'APPLICATION' && !isRemainingTimeZero &&
                               <>
                                    <br />
                                    <Button variant="info" onClick={setShowPayPenaltyConfirmationModal}>
                                        Pay Penalty
                                    </Button>
                               </> 
                            }


                            <ConfirmationModal
                                show={showPayPenaltyConfirmationModal}
                                onHide={() => setShowPayPenaltyConfirmationModal(false)}
                                heading={'Vote Confirmation'}
                                onConfirm={payPenaltyRequest} 
                            >
                                <div>Are you sure you pay the penalty?</div>
                                <div style={{ color: 'red' }}>You will need to transfer {payPenaltyAmount} ICX</div>
                            </ConfirmationModal>

                        </Alert>
                    </Col>
                </Row>
            }
        </Container>
    );
}

const mapStateToProps = state => (
    {
        payPenalty: state.account.payPenalty,
        period: state.period.period,

    }
);

const mapDispatchToProps = {
    payPenaltyRequest: payPenalty
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);