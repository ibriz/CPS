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
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  claimReward,
  fetchSponsorBondRequest,
  claimSponsorBondReward,
  fetchSponsorDepositAmountRequest,
} from 'Redux/Reducers/fundSlice';
import {
  fetchProjectAmountsRequest,
  fetchPriorityVotingRequest,
} from 'Redux/Reducers/proposalSlice';
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
import congratulationsImg from '../../Assets/Images/congratulations.png';
import congratulationsWhiteImg from '../../Assets/Images/congratulationsWhite.png';
import UpperCard from 'Containers/Proposals/UpperCard';
import { useSelector } from 'react-redux';

const Dashboard = ({
  payPenaltyRequest,
  payPenalty,
  period,
  projectAmounts,
  cpfRemainingFunds,
  cpfScoreAddress,
  fetchCPFTreasuryScoreAddressRequest,
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
  address,
  sponsorDepositAmount,
  fetchSponsorDepositAmountRequest,
  priorityVote,
  fetchPriorityVotingRequest,
}) => {
  const [showPayPenaltyConfirmationModal, setShowPayPenaltyConfirmationModal] =
    useState(false);
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
  const isDarkTheme = localStorage.getItem('theme') === 'dark';
  // const isDark = useSelector(state => state.theme.isDark);

  const getSponsorBondRewardText = amount => {
    if (parseFloat(amount.icx) > 0 && parseFloat(amount.bnUSD) > 0) {
      return `${icxFormat(parseFloat(amount.icx), true)} ICX (${icxFormat(
        parseFloat(amount.bnUSD),
        true,
      )} bnUSD)`;
    } else if (parseFloat(amount.icx) > 0) {
      return `${icxFormat(parseFloat(amount.icx), true)} ICX`;
    } else {
      return `${icxFormat(parseFloat(amount.bnUSD || 0), true)} bnUSD`;
    }
  };
  const getIcxbnUSDAmount = amount => {
    if (parseFloat(amount.icx) > 0 && parseFloat(amount.bnUSD) > 0) {
      return `${icxFormat(parseFloat(amount.icx), true)} ICX <br/> ${icxFormat(
        parseFloat(amount.bnUSD),
        true,
      )} bnUSD`;
    } else if (parseFloat(amount.icx) > 0) {
      return `${icxFormat(parseFloat(amount.icx), true)} ICX`;
    } else {
      return `${icxFormat(parseFloat(amount.bnUSD || 0), true)} bnUSD`;
    }
  };

  const cardTextColor = isDarkTheme ? '#D2D2D2' : '#27AAB9';

  if (!isPrep || !isRegistered) {
    cardInfo = [
      {
        color: cardTextColor,
        title: 'My Voting Proposals',
        // value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`}
        value: myProposalList.filter(
          proposal => proposal._status === '_pending',
        ).length,
      },
      {
        color: cardTextColor,
        title: 'My Approved Proposals',
        // value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
        value: myProposalList.filter(proposal =>
          ['_active', '_paused'].includes(proposal._status),
        ).length,
      },
      {
        color: cardTextColor,
        title: `Next Disbursement in ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
        // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
        value: getIcxbnUSDAmount(expectedGrant),
      },
      {
        title: `Remaining Time in ${
          period !== 'VOTING' ? 'Application Period' : 'Voting Period'
        }`,
        color: cardTextColor,
        // value={period === "APPLICATION" ? 'Application Period' : 'Voting Period'} />
        value: `${highestSignificantTime.value} ${highestSignificantTime.text}`,
      },
    ];
  } else {
    cardInfo = [
      {
        color: cardTextColor,
        title: 'My Voting Proposals',
        // value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`}
        value: myProposalList.filter(
          proposal => proposal._status === '_pending',
        ).length,
      },
      {
        color: cardTextColor,
        title: 'My Approved Proposals',
        // value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
        value: myProposalList.filter(proposal =>
          ['_active', '_paused'].includes(proposal._status),
        ).length,
      },
      {
        color: cardTextColor,
        title:
          period === 'APPLICATION'
            ? 'Remaining Sponsor Requests'
            : 'Outstanding Votes',
        // value={`${projectAmounts.Voting.count} (${icxFormat(projectAmounts.Voting.amount)} ICX)`}
        value:
          period === 'APPLICATION'
            ? totalCountSponsorRequests.Pending
            : priorityVote
            ? remainingVotesProposal.length + remainingVotesPR.length
            : remainingVotesProposal.length + remainingVotesPR.length + 1,
      },
      {
        title: `Remaining Time in ${
          period !== 'VOTING' ? 'Application Period' : 'Voting Period'
        }`,
        color: cardTextColor,
        // value={period === "APPLICATION" ? 'Application Period' : 'Voting Period'} />
        value: ` ${highestSignificantTime.value} ${highestSignificantTime.text}`,
      },
      {
        color: cardTextColor,
        title: 'My Sponsor Bond',
        // value={`${projectAmounts.Active.count + projectAmounts.Paused.count} (${icxFormat(projectAmounts.Active.amount + projectAmounts.Paused.amount)} ICX)`} />
        value: getIcxbnUSDAmount(sponsorDepositAmount),
        hoverText: 'Only active projects are counted',
      },
      {
        color: cardTextColor,
        title: `Next Sponsor Reward in  ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
        // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
        value: getIcxbnUSDAmount(sponsorReward),
      },
      {
        color: cardTextColor,
        title: `Next Disbursement in ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
        // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
        value: getIcxbnUSDAmount(expectedGrant),
      },

      // {
      //     color: cardTextColor,
      //     title: `Total Disbursement Due in ${highestSignificantTimeForGrant.value} ${highestSignificantTimeForGrant.text}`,
      //     // value={`${icxFormat(cpfRemainingFunds, true)} ICX`}
      //     value: `${icxFormat(parseFloat(expectedGrant) + parseFloat(sponsorReward), true)} ICX`
      // },
    ];
  }

  useEffect(() => {
    fetchCPFTreasuryScoreAddressRequest();
    fetchProjectAmountsRequest();
    fetchCPSTreasuryScoreAddressRequest();
  }, [
    fetchCPFTreasuryScoreAddressRequest,
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
    if (
      (parseFloat(withDrawAmountSponsorReward.icx) ||
        parseFloat(withDrawAmountProposalGrant.icx) > 0) &&
      (parseFloat(withDrawAmountSponsorReward.bnUSD) ||
        parseFloat(withDrawAmountProposalGrant.bnUSD) > 0)
    ) {
      return `${icxFormat(
        parseFloat(
          Number(withDrawAmountSponsorReward.icx)
            ? withDrawAmountSponsorReward.icx
            : withDrawAmountProposalGrant.icx,
        ),
        true,
      )} ICX (${icxFormat(
        parseFloat(
          Number(withDrawAmountSponsorReward.bnUSD)
            ? withDrawAmountSponsorReward.bnUSD
            : withDrawAmountProposalGrant.bnUSD,
        ),
        true,
      )} bnUSD)`;
    } else if (
      parseFloat(withDrawAmountSponsorReward.icx) ||
      parseFloat(withDrawAmountProposalGrant.icx) > 0
    ) {
      return `${icxFormat(
        parseFloat(
          Number(withDrawAmountSponsorReward.icx)
            ? withDrawAmountSponsorReward.icx
            : withDrawAmountProposalGrant.icx,
        ),
        true,
      )} ICX`;
    } else if (
      parseFloat(withDrawAmountSponsorReward.bnUSD) ||
      parseFloat(withDrawAmountProposalGrant.bnUSD) > 0
    ) {
      return `${icxFormat(
        parseFloat(
          Number(withDrawAmountSponsorReward.bnUSD)
            ? withDrawAmountSponsorReward.bnUSD
            : withDrawAmountProposalGrant.bnUSD,
        ),
        true,
      )} bnUSD`;
    }
  };

  useEffect(() => {
    if (isPrep && isRegistered && cpsTreasuryScoreAddress && address) {
      fetchSponsorDepositAmountRequest();
    }
  }, [isPrep, isRegistered, cpsTreasuryScoreAddress, address]);

  useEffect(() => {
    if (isPrep) {
      fetchPriorityVotingRequest();
    }
  }, [isPrep]);

  return address ? (
    <Container>
      {/* < Header title='Dashboard' /> */}
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
            <Alert variant='dark'>
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

      {(parseFloat(withDrawAmountSponsorReward.icx) > 0 ||
        parseFloat(withDrawAmountSponsorReward.bnUSD) > 0 ||
        parseFloat(withDrawAmountProposalGrant.icx) > 0 ||
        parseFloat(withDrawAmountProposalGrant.bnUSD) > 0) && (
        <Row style={{ marginTop: '15px' }}>
          <Col xs='12'>
            <Container className={styles.container}>
              <img
                src={isDarkTheme ? congratulationsWhiteImg : congratulationsImg}
                style={{ padding: '24px' }}
              />
              <Container
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  className={styles.textContainer}
                  style={{
                    fontWeight: '500',
                    fontSize: '1.5rem',
                    lineHeight: '2rem',
                  }}
                >
                  Congratulations!
                </span>

                <span
                  className={styles.textContainer}
                  style={{
                    fontWeight: '500',
                    fontSize: '1rem',
                    lineHeight: '2rem',
                  }}
                >
                  {isPrep
                    ? `You can claim installment amount of $${getClaimInstallment()}`
                    : `You can claim proposal grant of $${getClaimInstallment()}`}
                </span>
              </Container>
              {
                <>
                  <br />
                  <Button
                    className={styles.claimButton}
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
            </Container>
          </Col>
        </Row>
      )}

      {(parseFloat(sponsorBondReward.icx) > 0 ||
        parseFloat(sponsorBondReward.bnUSD) > 0) && (
        <Row style={{ marginTop: '15px' }}>
          <Col xs='12'>
            <Container className={styles.container}>
              <img src={congratulationsImg} style={{ padding: '24px' }} />
              {isPrep && (
                <Container style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontWeight: '500',
                      fontSize: '1.5rem',
                      lineHeight: '2rem',
                    }}
                  >
                    Congratulations!
                  </span>

                  <span
                    style={{
                      fontWeight: '500',
                      fontSize: '1rem',
                      lineHeight: '2rem',
                    }}
                  >
                    You can claim a total sponsor bond of $
                    {getSponsorBondRewardText(sponsorBondReward)}`
                  </span>
                </Container>
              )}
              {/* <Alert variant='success' style={{
                  background: "#fff",
                }}>
                  {isPrep &&
                    `Congratulations! You can claim a total sponsor bond of ${getSponsorBondRewardText(sponsorBondReward)}`} */}

              {
                <>
                  <br />
                  <Button
                    variant='info'
                    className={styles.claimButton}
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
              {/* </Alert> */}
            </Container>
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
      <Row style={{ justifyContent: 'center', padding: '24px 0px' }}>
        {cardInfo.map(info => (
          <Col
            lg='3'
            style={{ marginTop: '10px' }}
            className={styles.infoCardContainer}
          >
            <InfoCard
              bg={isDarkTheme ? 'dark' : 'light'}
              color={info.color}
              title={info.title}
              // value={`${ projectAmounts.Voting.count } (${ icxFormat(projectAmounts.Voting.amount) } ICX)`}
              value={info.value}
              hoverText={info.hoverText}
              border={!isDarkTheme}
            />
          </Col>
        ))}
      </Row>

      <UpperCard />

      {isPrep && isRegistered && period === 'VOTING' && (
        <>
          <div className={styles.myProposalHeading}>Pending Votes</div>

          <VotingCard
            proposalStatesList={
              period === 'VOTING'
                ? ['Priority Voting', 'Proposals', 'Progress Reports']
                : ['Proposals', 'Progress Reports']
            }
            initialState={period === 'VOTING' ? 'Priority Voting' : 'Proposals'}
            priorityVote={priorityVote}
          />
        </>
      )}

      {/* {
                (!isPrep || !isRegistered) && period === 'APPLICATION' &&
                <>
                    <div className={styles.myProposalHeading}>Proposals Pending Progress Report</div>

                    <ProposalPendingPRCard />
                </>
            } */}

      {
        <>
          {/* <div className={styles.myProposalHeading}>My Proposals</div> */}

          <MyProposalCard />
        </>
      }

      {isPrep && isRegistered && (
        <>
          <div className={styles.myProposalHeading}>Sponsored Projects</div>

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
    </Container>
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        paddingRight: 30,
        height: '100%',
      }}
    >
      <p
        style={{
          textAlign: 'center',
          fontSize: 20,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Sign in to use Dashboard
      </p>
    </div>
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
  address: state.account.address,
  sponsorDepositAmount: state.fund.sponsorDepositAmount,
  priorityVote: state.proposals.priorityVoting,
});

const mapDispatchToProps = {
  payPenaltyRequest: payPenalty,
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  fetchProjectAmountsRequest,
  fetchExpectedGrantRequest,
  fetchCPSTreasuryScoreAddressRequest,
  claimReward,
  claimSponsorBondReward,
  fetchSponsorBondRequest,
  fetchSponsorDepositAmountRequest,
  fetchPriorityVotingRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
