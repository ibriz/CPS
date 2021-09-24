import React, { useState, useEffect } from 'react';
import Header from '../../Components/Header';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { payPenalty } from 'Redux/Reducers/prepsSlice';
import { payPenaltyAmount } from 'Constants';
import { connect } from 'react-redux';
import useTimer from 'Hooks/useTimer';
import InfoCard from './InfoCard';
import { icxFormat } from 'Helpers';
import {
  fetchCPFScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  claimReward,
  fetchSponsorBondRequest,
  claimSponsorBondReward,
} from 'Redux/Reducers/fundSlice';
import { fetchProjectAmountsRequest } from 'Redux/Reducers/proposalSlice';
import styles from './Dashboard.module.scss';
import MyProposalCard from 'Components/MyProposalCard';
import ProposalPendingPRCard from 'Components/ProposalPendingPRCard';
import SponsorRequestsCard from 'Components/SponsorRequestsCard';
import VotingCard from 'Components/VotingCard';
import {
  fetchExpectedGrantRequest,
  fetchCPSTreasuryScoreAddressRequest,
} from 'Redux/Reducers/fundSlice';
import { setLoginButtonClicked } from 'Redux/Reducers/accountSlice';

const Dashboard = ({
  payPenaltyRequest,
  payPenalty,
  period,
  projectAmounts,
  cpfRemainingFunds,
  cpfScoreAddress,
  fetchCPFScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  fetchProjectAmountsRequest,
  isPrep,
  isRegistered,
  myProposalList,
  fetchExpectedGrantRequest,
  expectedGrant,
  sponsorBond,
  totalCountSponsorRequests,
  remainingVotesProposal,
  remainingVotesPR,
  fetchCPSTreasuryScoreAddressRequest,
  cpsTreasuryScoreAddress,
  payPenaltyAmount,
  sponsorReward,
  withDrawAmountSponsorReward,
  withDrawAmountProposalGrant,
  claimReward,
  previousPeriod,
  preps,
  fetchSponsorBondRequest,
  claimSponsorBondReward,
  sponsorBondReward,
}) => {
  const [
    showPayPenaltyConfirmationModal,
    setShowPayPenaltyConfirmationModal,
  ] = useState(false);
  const [
    showClaimRewardConfirmationModal,
    setShowClaimRewardConfirmationModal,
  ] = useState(false);
  const [
    showClaimSponsorBondRewardConfirmationModal,
    setShowClaimSponsorBondRewardConfirmationModal,
  ] = useState(false);

  const {
    isRemainingTimeZero,
    highestSignificantTime,
    highestSignificantTimeForGrant,
  } = useTimer();

  let cardInfo;

  const getSponsorBondRewardText = (amount) => {
    if (parseFloat(amount.icx) > 0 && parseFloat(amount.bnUSD) > 0) {
      return `${icxFormat(
        parseFloat(
          amount.icx
        ),
        true)} ICX (${icxFormat(
          parseFloat(
            amount.bnUSD
          ),
          true,
        )} bnUSD)`
    }
    else if (parseFloat(amount.icx) > 0) {
      return `${icxFormat(
        parseFloat(
          amount.icx
        ),
        true)} ICX`
    }
    else {
      return `${icxFormat(parseFloat(
        amount.bnUSD || 0
      ),
        true,
      )} bnUSD`
    }

  }
  const getIcxbnUSDAmount = (amount) => {
    if (parseFloat(amount.icx) > 0 && parseFloat(amount.bnUSD) > 0) {
      return `${icxFormat(
        parseFloat(
          amount.icx
        ),
        true)} ICX <br/> ${icxFormat(
          parseFloat(
            amount.bnUSD
          ),
          true,
        )} bnUSD`
    }
    else if (parseFloat(amount.icx) > 0) {
      return `${icxFormat(
        parseFloat(
          amount.icx
        ),
        true)} ICX`
    }
    else {
      return `${icxFormat(parseFloat(
        amount.bnUSD || 0
      ),
        true,
      )} bnUSD`
    }

  }

  if (!isPrep || !isRegistered) {
    cardInfo = [
      {
        color: '#1AAABA',
        title: 'My Voting Proposals',
        // value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`}
        value: myProposalList.filter(
          proposal => proposal._status === '_pending',
        ).length,
      },
      {
        color: '#1AAABA',
        title: 'My Approved Proposals',
        // value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
        value: myProposalList.filter(proposal =>
          ['_active', '_paused'].includes(proposal._status),
        ).length,
      },
      {
        color: '#1AAABA',
        title: `Next Disbursement in ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
        // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
        value: getIcxbnUSDAmount(expectedGrant)
      },
      {
        title: `Remaining Time in ${period !== 'VOTING' ? 'Application Period' : 'Voting Period'
          }`,
        color: '#1AAABA',
        // value={period === "APPLICATION" ? 'Application Period' : 'Voting Period'} />
        value: `${highestSignificantTime.value} ${highestSignificantTime.text}`,
      },
    ];
  } else {
    cardInfo = [
      {
        color: '#1AAABA',
        title: 'My Voting Proposals',
        // value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`}
        value: myProposalList.filter(
          proposal => proposal._status === '_pending',
        ).length,
      },
      {
        color: '#1AAABA',
        title: 'My Approved Proposals',
        // value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
        value: myProposalList.filter(proposal =>
          ['_active', '_paused'].includes(proposal._status),
        ).length,
      },
      {
        color: '#1AAABA',
        title:
          period === 'APPLICATION'
            ? 'Remaining Sponsor Requests'
            : 'Outstanding Votes',
        // value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`}
        value:
          period === 'APPLICATION'
            ? totalCountSponsorRequests.Pending
            : remainingVotesProposal.length + remainingVotesPR.length,
      },
      {
        title: `Remaining Time in ${period !== 'VOTING' ? 'Application Period' : 'Voting Period'
          }`,
        color: '#1AAABA',
        // value={period === "APPLICATION" ? 'Application Period' : 'Voting Period'} />
        value: ` ${highestSignificantTime.value} ${highestSignificantTime.text}`,
      },
      {
        color: '#1AAABA',
        title: 'My Sponsor Bond',
        // value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
        value: getIcxbnUSDAmount(sponsorBond),
      },
      {
        color: '#1AAABA',
        title: `Next Sponsor Reward in  ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
        // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
        value: getIcxbnUSDAmount(sponsorReward),
      },
      {
        color: '#1AAABA',
        title: `Next Disbursement in ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
        // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
        value: getIcxbnUSDAmount(expectedGrant),
      },

      // {
      //     color: '#1AAABA',
      //     title: `Total Disbursement Due in ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
      //     // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
      //     value: `${icxFormat(parseFloat(expectedGrant) + parseFloat(sponsorReward), true)} ICX`
      // },
    ];
  }

  useEffect(() => {
    fetchCPFScoreAddressRequest();
    fetchProjectAmountsRequest();
    fetchCPSTreasuryScoreAddressRequest();
  }, [
    fetchCPFScoreAddressRequest,
    fetchProjectAmountsRequest,
    fetchExpectedGrantRequest,
  ]);

  useEffect(() => {
    if (cpsTreasuryScoreAddress) {
      fetchExpectedGrantRequest({
        type: 'proposalGrant',
      });

      if (isPrep && isRegistered) {
        fetchExpectedGrantRequest({
          type: 'sponsorReward',
        });
        fetchSponsorBondRequest();
      }
    }
  }, [
    cpsTreasuryScoreAddress,
    fetchExpectedGrantRequest,
    isPrep,
    isRegistered,
    fetchSponsorBondRequest,
  ]);

  useEffect(() => {
    fetchCPFRemainingFundRequest();
  }, [fetchCPFRemainingFundRequest, cpfScoreAddress]);

  const getClaimInstallment = () => {
    if ((parseFloat(withDrawAmountSponsorReward
      .icx) || parseFloat(withDrawAmountProposalGrant
        .icx) > 0) && (parseFloat(withDrawAmountSponsorReward
          .bnUSD) || parseFloat(withDrawAmountProposalGrant
            .bnUSD) > 0)) {
      return `${icxFormat(
        parseFloat(
          Number(withDrawAmountSponsorReward.icx)
            ? withDrawAmountSponsorReward.icx
            : withDrawAmountProposalGrant.icx,
        ),
        true)} ICX (${icxFormat(
          parseFloat(
            Number(withDrawAmountSponsorReward.bnUSD)
              ? withDrawAmountSponsorReward.bnUSD
              : withDrawAmountProposalGrant.bnUSD,
          ),
          true,
        )} bnUSD)`
    }
    else if (parseFloat(withDrawAmountSponsorReward
      .icx) || parseFloat(withDrawAmountProposalGrant
        .icx) > 0) {
      return `${icxFormat(
        parseFloat(
          Number(withDrawAmountSponsorReward.icx)
            ? withDrawAmountSponsorReward.icx
            : withDrawAmountProposalGrant.icx,
        ),
        true)} ICX`
    }
    else if ((parseFloat(withDrawAmountSponsorReward
      .bnUSD) || parseFloat(withDrawAmountProposalGrant
        .bnUSD) > 0)) {
      return `${icxFormat(parseFloat(
        Number(withDrawAmountSponsorReward.bnUSD)
          ? withDrawAmountSponsorReward.bnUSD
          : withDrawAmountProposalGrant.bnUSD,
      ),
        true,
      )} bnUSD`
    }

  }
  return (
    <Container>
      <Header title='Dashboard' />

      <Row style={{ marginTop: '30px' }}>
        <Col xs='12'>
          <div className={styles.period}>
            Period:{' '}
            {period !== 'VOTING' ? 'Application Period' : 'Voting Period'}
          </div>
        </Col>
      </Row>

      {period === 'APPLICATION' && previousPeriod === 'APPLICATION' && (
        <Row style={{ marginTop: '15px' }}>
          <Col xs='12'>
            <Alert variant='info'>
              <span>
                Note: The period switched back to application period because{' '}
                {preps.length < 7
                  ? 'there were less than 7 P-Reps'
                  : 'there were no voting proposals or progress reports.'}
              </span>
            </Alert>
          </Col>
        </Row>
      )}

      {(parseFloat(withDrawAmountSponsorReward.icx) > 0 || parseFloat(withDrawAmountSponsorReward.bnUSD) > 0 ||
        parseFloat(withDrawAmountProposalGrant.icx) > 0 || parseFloat(withDrawAmountProposalGrant.bnUSD) > 0) && (
          <Row style={{ marginTop: '15px' }}>
            <Col xs='12'>
              <Alert variant='success'>
                {isPrep
                  ? `Congratulations! You can claim installment amount of ${getClaimInstallment()}`
                  : `Congratulations! You can claim proposal grant of ${getClaimInstallment()}`}

                {
                  <>
                    <br />
                    <Button
                      variant='info'
                      onClick={setShowClaimRewardConfirmationModal}
                    >
                      Claim Installment
                    </Button>
                  </>
                }

                <ConfirmationModal
                  show={showClaimRewardConfirmationModal}
                  onHide={() => setShowClaimRewardConfirmationModal(false)}
                  heading={'Reward Claim Confirmation'}
                  onConfirm={claimReward}
                >
                  <div>Are you sure you want to claim the reward?</div>
                </ConfirmationModal>
              </Alert>
            </Col>
          </Row>
        )}

      {(parseFloat(sponsorBondReward.icx) > 0 || parseFloat(sponsorBondReward.bnUSD) > 0) && (
        <Row style={{ marginTop: '15px' }}>
          <Col xs='12'>
            <Alert variant='success'>
              {isPrep &&
                `Congratulations! You can claim a total sponsor bond of ${getSponsorBondRewardText(sponsorBondReward)}`}

              {
                <>
                  <br />
                  <Button
                    variant='info'
                    onClick={setShowClaimSponsorBondRewardConfirmationModal}
                  >
                    Claim Sponsor Bond
                  </Button>
                </>
              }

              <ConfirmationModal
                show={showClaimSponsorBondRewardConfirmationModal}
                onHide={() =>
                  setShowClaimSponsorBondRewardConfirmationModal(false)
                }
                heading={'Reward Claim Confirmation'}
                onConfirm={claimSponsorBondReward}
              >
                <div>Are you sure you want to claim the reward?</div>
              </ConfirmationModal>
            </Alert>
          </Col>
        </Row>
      )}

      {payPenalty && (
        <Row style={{ marginTop: '15px' }}>
          <Col xs='12'>
            <Alert variant='danger'>
              {period === 'APPLICATION' && !isRemainingTimeZero
                ? `You missed voting on some of the proposals or progress reports in the voting period.Please pay the penalty amount of ${payPenaltyAmount} bnUSD to re - register.`
                : `You missed voting on some of the proposals or progress reports in the voting period.Please pay the penalty amount of ${payPenaltyAmount} bnUSD in the next Application period to re - register.`}

              {period === 'APPLICATION' && !isRemainingTimeZero && (
                <>
                  <br />
                  <Button
                    variant='info'
                    onClick={setShowPayPenaltyConfirmationModal}
                  >
                    Pay Penalty
                  </Button>
                </>
              )}

              <ConfirmationModal
                show={showPayPenaltyConfirmationModal}
                onHide={() => setShowPayPenaltyConfirmationModal(false)}
                heading={'Vote Confirmation'}
                onConfirm={payPenaltyRequest}
              >
                <div>Are you sure you pay the penalty?</div>
                <div style={{ color: 'red' }}>
                  You will need to transfer {`${payPenaltyAmount} `} ICX
                </div>
              </ConfirmationModal>
            </Alert>
          </Col>
        </Row>
      )}
      <Row style={{ justifyContent: 'center' }}>
        {cardInfo.map(info => (
          <Col
            lg='3'
            style={{ marginTop: '10px' }}
            className={styles.infoCardContainer}
          >
            <InfoCard
              bg='light'
              color={info.color}
              title={info.title}
              // value={`${ projectAmounts.Voting.count } (${ icxFormat(projectAmounts.Voting.amount) } ICX)`}
              value={info.value}
            />
          </Col>
        ))}
      </Row>

      {/* {
                (!isPrep || !isRegistered) && period === 'APPLICATION' &&
                <>
                    <div className={styles.myProposalHeading}>Proposals Pending Progress Report</div>

                    <ProposalPendingPRCard />
                </>
            } */}

      {
        <>
          <div className={styles.myProposalHeading}>My Proposals</div>

          <MyProposalCard />
        </>
      }

      {isPrep && isRegistered && (
        <>
          <div className={styles.myProposalHeading}>Sponsor Requests</div>

          <SponsorRequestsCard
            proposalStatesList={[
              'Pending',
              'Approved',
              'Rejected',
              'Disqualified',
            ]}
            initialState={'Pending'}
          />
        </>
      )}

      {isPrep && isRegistered && (
        <>
          <div className={styles.myProposalHeading}>Pending Votes</div>

          <VotingCard
            proposalStatesList={['Proposals', 'Progress Reports']}
            initialState={'Proposals'}
          />
        </>
      )}
    </Container>
  );
};

const mapStateToProps = state => ({
  payPenalty: state.account.payPenalty,
  period: state.period.period,
  previousPeriod: state.period.previousPeriod,
  projectAmounts: state.proposals.projectAmounts,
  cpfRemainingFunds: state.fund.cpfRemainingFunds,
  cpfScoreAddress: state.fund.cpfScoreAddress,
  isPrep: state.account.isPrep,
  isRegistered: state.account.isRegistered,
  myProposalList: state.proposals.myProposalList,
  expectedGrant: state.fund.expectedGrant,
  sponsorBond: state.fund.sponsorBond,
  sponsorReward: state.fund.sponsorReward,
  sponsorBondReward: state.fund.sponsorBondReward,
  totalCountSponsorRequests: state.proposals.totalCountSponsorRequests,

  remainingVotesProposal: state.proposals.remainingVotes,
  remainingVotesPR: state.progressReport.remainingVotes,

  cpsTreasuryScoreAddress: state.fund.cpsTreasuryScoreAddress,

  payPenaltyAmount: state.account.penaltyAmount,

  withDrawAmountSponsorReward: state.fund.withDrawAmountSponsorReward,
  withDrawAmountProposalGrant: state.fund.withDrawAmountProposalGrant,
  preps: state.preps.preps,
});

const mapDispatchToProps = {
  payPenaltyRequest: payPenalty,
  fetchCPFScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  fetchProjectAmountsRequest,
  fetchExpectedGrantRequest,
  fetchCPSTreasuryScoreAddressRequest,
  claimReward,
  claimSponsorBondReward,
  fetchSponsorBondRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
