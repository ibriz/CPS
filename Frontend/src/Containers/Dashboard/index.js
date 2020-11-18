import React, { useState, useEffect } from 'react';
import Header from '../../Components/Header';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { payPenalty } from 'Redux/Reducers/prepsSlice';
import { payPenaltyAmount } from 'Constants';
import { connect } from 'react-redux';
import useTimer from 'Hooks/useTimer';
import InfoCard from './InfoCard';
import { icxFormat } from 'helpers';
import { fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest } from 'Redux/Reducers/fundSlice';
import { fetchProjectAmountsRequest } from 'Redux/Reducers/proposalSlice';
import styles from './Dashboard.module.scss';
import MyProposalCard from 'Components/MyProposalCard';
import ProposalPendingPRCard from 'Components/ProposalPendingPRCard';
import SponsorRequestsCard from 'Components/SponsorRequestsCard';
import VotingCard from 'Components/VotingCard';




const Dashboard = ({ payPenaltyRequest, payPenalty, period, projectAmounts, cpfRemainingFunds, cpfScoreAddress, fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest, fetchProjectAmountsRequest, isPrep, isRegistered }) => {
    const [showPayPenaltyConfirmationModal, setShowPayPenaltyConfirmationModal] = useState(false);
    const { isRemainingTimeZero } = useTimer();

    useEffect(() => {
        fetchCPFScoreAddressRequest();
        fetchProjectAmountsRequest();
    }, [fetchCPFScoreAddressRequest, fetchProjectAmountsRequest]);

    useEffect(() => {
        fetchCPFRemainingFundRequest();
    }, [fetchCPFRemainingFundRequest, cpfScoreAddress])

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
            <Row style={{ marginTop: '30px' }}>
                <Col lg="3" style={{ marginTop: '10px', }} className={styles.infoCardContainer}>
                    <InfoCard bg="success"
                        title="Voting Proposals"
                        value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`} />
                </Col>
                <Col lg="3" style={{ marginTop: '10px' }} className={styles.infoCardContainer}>
                    <InfoCard bg="warning"
                        title="Active Proposals"
                        value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
                </Col>
                <Col lg="3" style={{ marginTop: '10px' }} className={styles.infoCardContainer}>
                    <InfoCard bg="info"
                        title="CPF Remaining Funds"
                        value={`${icxFormat(cpfRemainingFunds, true)} ICX`} />
                </Col>
                <Col lg="3" style={{ marginTop: '10px' }} className={styles.infoCardContainer}>
                    <InfoCard bg="danger"
                        title="Period"
                        value={period === "APPLICATION" ? 'Application Period' : 'Voting Period'} />
                </Col>
            </Row>

            {
                (!isPrep ||  !isRegistered) && period === 'APPLICATION' &&
                <>
                    <div className = {styles.myProposalHeading}>Proposals Pending Progress Report</div>

                    <ProposalPendingPRCard />
                </>
            }


            {
                (!isPrep ||  !isRegistered) && 
                <>
                    <div className = {styles.myProposalHeading}>My Proposals</div>

                    <MyProposalCard />
                </>
            }


{
                (isPrep ||  isRegistered) && 
                <>
                    <div className = {styles.myProposalHeading}>Sponsor Requests</div>

                    <SponsorRequestsCard
                        proposalStatesList = {['Pending', 'Approved', 'Rejected', 'Disqualified']}
                        initialState = {'Pending'} />
                </>
            }

{
                (isPrep ||  isRegistered) && 
                <>
                    <div className = {styles.myProposalHeading}>Voting</div>

                    <VotingCard
                proposalStatesList = {['Proposals', 'Progress Reports']}
                initialState = {'Proposals'}
            />
            </>
            }







        </Container>
    );
}

const mapStateToProps = state => (
    {
        payPenalty: state.account.payPenalty,
        period: state.period.period,
        projectAmounts: state.proposals.projectAmounts,
        cpfRemainingFunds: state.fund.cpfRemainingFunds,
        cpfScoreAddress: state.fund.cpfScoreAddress,
        isPrep: state.account.isPrep,
        isRegistered: state.account.isRegistered


    }
);

const mapDispatchToProps = {
    payPenaltyRequest: payPenalty,
    fetchCPFScoreAddressRequest,
    fetchCPFRemainingFundRequest,
    fetchProjectAmountsRequest
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);