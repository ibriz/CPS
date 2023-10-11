import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Col,
  Row,
  Container,
  Badge,
  ButtonGroup,
  Alert,
  Spinner,
} from 'react-bootstrap';
import {
  Header,
  Address,
  DetailsTable,
  Description,
  MilestoneTable,
  ListTitle,
} from 'Components/UI/DetailsModal';
import styles from './ProgressReportDetailsPage.module.css';
import MilestoneVoteCard from 'Components/MilestoneVotingCard';
import {
  fetchChangeVoteRequestProgressReport,
  fetchProgressReportByIpfsRequest,
  fetchProgressReportDetailRequest,
  emptyProgressReportDetailRequest,
  // approveSponserRequest, rejectSponsorRequest, voteProposal
} from 'Redux/Reducers/progressReportSlice';
import {
  approveSponserRequest,
  rejectSponsorRequest,
  voteProposal,
  VotingPhase,
} from 'Redux/Reducers/proposalSlice';
import {
  voteProgressReport,
  fetchVoteResultRequest,
  fetchVoteResultBudgetChangeRequest,
} from 'Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import {
  progressReportStatusMapping,
  specialCharacterMessage,
} from 'Constants';
import VoteList from 'Components/Card/DetailsModalProgressReport/VoteList';
import RichTextEditor from 'Components/RichTextEditor';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import {
  getProgressReportApprovedPercentage,
  getProgressReportApprovedVotersPercentage,
  getBudgetAdjustmentApprovedPercentage,
  getBudgetAdjustmentApprovedVotersPercentage,
  getProgressReportRejectedPercentage,
  getProgressReportRejectedVotersPercentage,
  getBudgetAdjustmentRejectedPercentage,
  getBudgetAdjustmentRejectedVotersPercentage,
} from 'Selectors';
import { formatDescription, icxFormat } from 'Helpers';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import useTimer from 'Hooks/useTimer';
import VoteProgressBar from 'Components/VoteProgressBar';
import InfoIcon from 'Components/InfoIcon';
import styled from 'styled-components';
import { NotificationManager } from 'react-notifications';
import Popup from 'Components/Popup';
import { fetchMaintenanceModeRequest } from 'Redux/Reducers/fundSlice';
import {
  withRouter,
  useLocation,
  useParams,
  useHistory,
} from 'react-router-dom';
import BackButton from 'Components/UI/BackButton';
import InformationCard from 'Components/UI/DetailsModal/DetailsTable/Card';

const LoadingDiv = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const milestoneArray = [
  {
    name: 'Project started',
    description:
      ' Some placeholder content for the first accordion panel. This panel is shown by default, thanks to the <code>.show ',
  },
  {
    name: 'Project started',
    description:
      ' Some placeholder content for the first accordion panel. This panel is shown by default, thanks to the <code>.show ',
  },
  {
    name: 'Project started',
    description:
      ' Some placeholder content for the first accordion panel. This panel is shown by default, thanks to the <code>.show ',
  },
];

// show={modalShowPR}
//                   onHide={() => setModalShowPR(false)}
//                   progressReport={selectedProgressReport}
//                   status={status}
//                   voting={true}

function ProgressReportDetailsPage(props) {
  const voteOptions = [
    { title: 'Approve', bgColor: 'success', value: '_approve' },
    { title: 'Reject', bgColor: 'danger', value: '_reject' },
  ];
  const [vote, setVote] = useState([]);
  const isDarkTheme = localStorage.getItem('theme') === 'dark';
  const [voteProjectTermRevision, setVoteProjectTermRevision] = useState();

  const [voteReason, setVoteReason] = useState('');
  const [sponsorConfirmationShow, setSponsorConfirmationShow] =
    React.useState(false);
  const [sponsorVote, setSponsorVote] = useState('');
  const [description, setDescription] = useState(null);
  const [revisionDescription, setRevisionDescription] = useState(null);

  const [voteConfirmationShow, setVoteConfirmationShow] = React.useState(false);
  const { remainingTime: remainingTimer } = useTimer();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [changeVoteButton, setChangeVoteButton] = useState(false);
  const history = useHistory();
  const {
    progressDetail,
    proposal,
    sponsorRequest = false,
    approveSponserRequest,
    rejectSponsorRequest,
    voting = false,
    voteProgressReport,
    votesByProgressReport,
    fetchVoteResultRequest,
    approvedPercentage,
    period,
    remainingTime,
    approvedVoterPercentage,
    fetchProgressReportDetailRequest,
    walletAddress,
    fetchVoteResultBudgetChangeRequest,
    approvedPercentageBudgetChange,
    approvedVoterPercentageBudgetChange,
    votesByBudgetChange,
    rejectedPercentage,
    rejectedVotersPercentage,
    rejectedPercentageBudgetChange,
    rejectedVoterPercentageBudgetChange,
    isPrep,
    ipfsError,
    changeVote,
    fetchChangeVoteRequest,
    votingPRep,
    isMaintenanceMode,
    fetchMaintenanceModeRequest,
    fetchProgressReportByIpfsRequest,
    selectedProgressReportByIpfs,
    emptyProgressReportDetailRequest,
    votingPhase,
    ...remainingProps
  } = props;

  const [progressReport, setProgressReport] = React.useState();

  // console.log(selectedProgressReportByIpfs);

  useEffect(() => {
    if (selectedProgressReportByIpfs?.ipfsHash) {
      console.log('Here', { selectedProgressReportByIpfs });
      setProgressReport(selectedProgressReportByIpfs);
      setTimeout(() => {}, 300);
    }
  }, [selectedProgressReportByIpfs]);

  const status = progressReportStatusMapping.find(
    mapping => mapping.status === progressReport?.status,
  )?.name;

  const progressReportIpfsKey = useParams()?.id;
  useEffect(() => {
    if (progressReportIpfsKey) {
      fetchProgressReportByIpfsRequest({
        ipfs_key: progressReportIpfsKey,
      });
    }
  }, []);

  useEffect(() => {
    console.log('voteReason', voting);
    console.log(
      'voteReason 1',

      period === 'VOTING',
    );

    console.log(
      'voteReason',

      remainingTime > 0,
    );
    console.log(
      'voteReason',

      !votesByProgressReport.some(
        vote => vote.sponsorAddress === walletAddress,
      ),
    );
    console.log(
      'voteReason',

      { walletAddress },
    );
    votesByProgressReport.forEach(vote =>
      console.log('voteReason', { voteAddr: vote.sponsorAddress }),
    );
    console.log(
      'voteReason',
      voting &&
        period === 'VOTING' &&
        remainingTime > 0 &&
        !votesByProgressReport.some(
          vote => vote.sponsorAddress === walletAddress,
        ),
    );
    if (
      voting &&
      period === 'VOTING' &&
      remainingTime > 0 &&
      !votesByProgressReport.some(vote => vote.sponsorAddress === walletAddress)
    ) {
      console.log('voteReasonhere', document.getElementById('voteReason'));
      if (!voteReason) {
        document.getElementById('voteReason') &&
          document
            .getElementById('voteReason')
            .setCustomValidity(`Please type a reason for your decision.`);
      } else {
        document.getElementById('voteReason') &&
          document.getElementById('voteReason').setCustomValidity(``);
      }
    }
  }, [
    voteReason,
    voting,
    period,
    remainingTime,
    votesByProgressReport,
    walletAddress,
  ]);

  const handleVoteSubmission = () => {
    if (
      progressDetail &&
      progressDetail.projectTermRevision &&
      !voteProjectTermRevision
    ) {
      setError('Please cast your vote');
      return;
    }
    if (!vote) {
      setError('Please cast your vote');
      return;
    }
    if (document.getElementById('voteReason').reportValidity()) {
      setError('');
      setVoteConfirmationShow(true);
    }
  };

  useEffect(() => {
    if (progressReport) {
      emptyProgressReportDetailRequest();
      setLoading(false);
      props.fetchProgressReportDetailRequest({
        hash: progressReport.ipfsHash,
      });
    }
  }, [progressReport]);

  useEffect(() => {
    if (progressDetail) {
      // setLoading(false);
    }
    let description = formatDescription(progressDetail?.description);
    setDescription(description);
  }, [progressDetail?.description]);

  useEffect(() => {
    let description = formatDescription(progressDetail?.revisionDescription);
    setRevisionDescription(description);
  }, [progressDetail?.revisionDescription]);

  useEffect(() => {
    fetchMaintenanceModeRequest();
  }, [fetchMaintenanceModeRequest]);

  useEffect(() => {
    // alert("Voting");
    progressReport &&
      fetchVoteResultRequest({
        reportKey: progressReport.reportKey,
      });

    progressReport &&
      fetchVoteResultBudgetChangeRequest({
        reportKey: progressReport.reportKey,
      });
  }, [progressReport, props.show, votingPhase]);

  useEffect(() => {
    progressReport &&
      fetchChangeVoteRequest({
        ipfs_key: progressReport.ipfsHash,
        address: walletAddress,
      });
  }, [progressReport]);

  const [voteLoading, setVoteLoading] = React.useState(false);

  const onSubmitVote = () => {
    if (vote.length !== progressDetail?.completedMilestone?.length) {
      NotificationManager.error('You need to vote on all Milestone Reports');
    } else {
      voteProgressReport({
        vote,
        voteReason: voteReason.replace(/&nbsp;/g, ''),
        voteProjectTermRevision: progressDetail?.projectTermRevision
          ? voteProjectTermRevision
          : null,
        proposalKey: progressReport.proposalKey,
        reportKey: progressReport.reportKey,
        vote_change: changeVoteButton ? '1' : '0',
      });
    }
  };

  useEffect(() => {
    if (votingPhase === VotingPhase.IDLE) setVoteLoading(false);
    else setVoteLoading(true);
  }, [votingPhase]);

  const onClickApproveSponsorRequest = () => {
    approveSponserRequest({
      // ipfsKey: proposal.ipfsKey,
      // sponsorBond: proposalDetail.totalBudget * 0.1
    });
    // props.onHide();
  };

  const onClickRejectSponsorRequest = () => {
    rejectSponsorRequest({
      // ipfsKey: proposal.ipfsKey,
    });
    // props.onHide();
  };

  useEffect(() => {
    if (ipfsError) {
      setLoading(false);
      // props.onHide();
      NotificationManager.error('Error fetching ipfs data');
    }
  }, [ipfsError]);


  return (
    <Container fluid>
      {loading || !progressDetail ? (
        <Container>
          <LoadingDiv>
            <Spinner animation='border' variant='secondary' />
          </LoadingDiv>
        </Container>
      ) : (
        !ipfsError && (
          <>
            <BackButton onClick={history.goBack}></BackButton>

            <Container fluid className={styles.modalHeader}>
              <Container fluid className={styles.container}>
                <Row>
                  <Col sm='12'>
                    <Header>
                      {(progressDetail && progressDetail.progressReportTitle) ||
                        'N/A'}
                    </Header>
                  </Col>
                </Row>
                <Row>
                  <Col sm='12'>
                    <Address>
                      Project Name- {progressReport?.projectTitle || 'N/A'}
                    </Address>
                    {'    '}
                    <Badge
                      variant={
                        progressReportStatusMapping.find(mapping => {
                          return mapping.name === status;
                        })?.badgeColor
                      }
                    >
                      {status}
                    </Badge>
                  </Col>
                  <Col></Col>
                </Row>
              </Container>
              <Col
                style={{
                  backgroundColor: 'var(--proposal-card-color)',
                  borderRadius: 4,
                  marginBottom: 12,
                  paddingTop: '16px',
                }}
              >
                <Col style={{ gap: 6 }}>
                  <InformationCard
                    title={'Project Details'}
                    data={[
                      {
                        key: 'Percentage Completed',
                        value: progressDetail?.percentageCompleted
                          ? `${progressDetail?.percentageCompleted}%`
                          : 'N/A',
                      },
                      {
                        key: 'Time Remaining',
                        value: progressDetail?.timeRemainingToCompletion
                          ? `${progressDetail?.timeRemainingToCompletion} months`
                          : 'N/A',
                      },
                      {
                        key: 'Submitted On',
                        value: `${new Date(
                          progressReport?.timestamp / 1000,
                        ).toLocaleDateString()}`,
                      }
                    ]}
                  />

                  {progressDetail?.projectTermRevision && (
                    <InformationCard
                      title={'Project Term Revision'}
                      data={[
                        {
                          key: 'Additional Budget',
                          value: progressDetail?.additionalBudget
                            ? `${icxFormat(
                                progressDetail?.additionalBudget,
                              )} ICX`
                            : 'N/A',
                        },
                        {
                          key: 'Additional Time',
                          value: progressDetail?.additionalTime
                            ? `${progressDetail?.additionalTime} months`
                            : 'N/A',
                        },
                        {
                          key: 'Stake (Budget Change Request)',
                          value: (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <ProgressBarCombined
                                approvedPercentage={
                                  approvedPercentageBudgetChange
                                }
                                rejectedPercentage={
                                  rejectedPercentageBudgetChange
                                }
                              />

                              <Container
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                }}
                              >
                                <VoteProgressBar
                                  approvedPercentage={
                                    approvedPercentageBudgetChange
                                  }
                                  rejectedPercentage={
                                    rejectedPercentageBudgetChange
                                  }
                                  noProgressBar
                                  // budgetAdjustment
                                />
                              </Container>
                            </div>
                          ),
                        },
                        {
                          key: 'Voter Count (Budget Change Request)',
                          value: (
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <ProgressBarCombined
                                approvedPercentage={
                                  approvedVoterPercentageBudgetChange
                                }
                                rejectedPercentage={
                                  rejectedVoterPercentageBudgetChange
                                }
                              />

                              <Container
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                }}
                              >
                                <VoteProgressBar
                                  approvedPercentage={
                                    approvedVoterPercentageBudgetChange
                                  }
                                  rejectedPercentage={
                                    rejectedVoterPercentageBudgetChange
                                  }
                                  noProgressBar
                                  // budgetAdjustment
                                  voterCount
                                />
                              </Container>
                            </div>
                          ),
                        },
                      ]}
                    />
                  )}
                </Col>
              </Col>
              <Container fluid className={styles.modalBody}>
                <Row>
                  <Col style={{ padding: '0px', wordBreak: 'break-word' }}>
                    <Col
                      // lg='8'
                      // xs='12'
                      className={styles.description}
                      // style={{ background: 'white', paddingTop: '16px' }}
                    >
                      {/* <div dangerouslySetInnerHTML={{ __html: description }} /> */}
                      <Description
                        description={
                          (progressDetail && description) ||
                          '<span>No Description</span>'
                        }
                      />
                      {progressDetail && progressDetail.projectTermRevision ? (
                        <Description
                          description={
                            (progressDetail && revisionDescription) ||
                            '<span>No Description</span>'
                          }
                          title='REVISION DESCRIPTION'
                        />
                      ) : null}
                    </Col>

                    {status === 'Voting' && (
                      <Row>
                        <Col xs='12'>
                          <div
                            style={{
                              color: 'var(--proposal-text-color)',
                              backgroundColor: 'var(--proposal-card-color)',
                              marginBottom: '5px',
                              marginTop: '16px',
                              fontSize: '1.5rem',
                              lineHeight: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                              textAlign: 'center',
                              paddingTop: '50px',
                              paddingBottom: '50px',
                              width: '100%',
                            }}
                          >
                            <div>
                              {period !== 'VOTING'
                                ? 'Voting starts in '
                                : 'Voting ends in '}
                            </div>
                            <div>
                              <b>{remainingTimer.day}</b> days{' '}
                              <b>{remainingTimer.hour}</b> hours{' '}
                              <b>{remainingTimer.minute}</b> minutes{' '}
                              <b>{remainingTimer.second}</b> seconds
                            </div>
                          </div>
                        </Col>
                      </Row>
                    )}

                    {progressDetail?.contributor_address === walletAddress &&
                      status === 'Pending' && (
                        <Row style={{ justifyContent: 'center' }}>
                          <Button
                            variant='success'
                            // onClick={onClickApproveSponsorRequest}
                            onClick={() => {
                              setSponsorConfirmationShow(true);
                              setSponsorVote('approve');
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant='danger'
                            className={styles.rejectButton}
                            // onClick={onClickRejectSponsorRequest}
                            onClick={() => {
                              setSponsorConfirmationShow(true);
                              setSponsorVote('reject');
                            }}
                          >
                            Reject
                          </Button>
                        </Row>
                      )}

                    {isPrep &&
                      votingPRep &&
                      period === 'VOTING' &&
                      status === 'Voting' &&
                      remainingTime > 0 &&
                      (voteLoading ? (
                        <Container
                          fluid
                          style={{
                            backgroundColor: 'var(--proposal-card-color)',
                          }}
                        >
                          <LoadingDiv>
                            <Spinner animation='border' variant='secondary' />
                          </LoadingDiv>
                        </Container>
                      ) : (
                        <Container
                          fluid
                          style={{
                            marginTop: '12px',
                            backgroundColor: 'var(--proposal-card-color)',
                            padding: '12px',
                          }}
                        >
                          {
                            <>
                              {progressDetail?.projectTermRevision && (
                                <Row>
                                  <Col
                                    xs='12'
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: 'var(--proposal-text-color)',
                                        fontWeight: 600,
                                      }}
                                    >
                                      Progress Report:
                                    </span>
                                  </Col>
                                </Row>
                              )}

                              <Row>
                                <Col
                                  xs='12'
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                  }}
                                ></Col>
                              </Row>
                              {progressDetail?.completedMilestone && progressDetail?.completedMilestone?.map(
                                (milestone, index) => {
                                  // console.log("votes of each milestones",votesByProgressReport.filter(x=>Number(x.milestoneId) === milestone.id))
                                  return (
                                    <div
                                      key={index}
                                      id='milestoneArray'
                                      className='d-flex flex-column'
                                    >
                                      <MilestoneVoteCard
                                        id={milestone?.id}
                                        reportKey={selectedProgressReportByIpfs?.reportKey}
                                        name={milestone?.name}
                                        votesByProgressReport={votesByProgressReport?.filter(
                                          x =>
                                            Number(x.milestoneId) ===
                                            milestone.id,
                                        )}
                                        duration={milestone.duration}
                                        button={
                                          (!votesByProgressReport.some(
                                            vote =>
                                              vote.sponsorAddress ===
                                              walletAddress,
                                          ) ||
                                            changeVoteButton) && (
                                            <ButtonGroup aria-label='Basic example'>
                                              {voteOptions.map(voteOption => (
                                                <Button
                                                  key={voteOption.value}
                                                  variant={
                                                    vote[
                                                      vote.findIndex(
                                                        v =>
                                                          v.id ===
                                                          milestone.id.toString(),
                                                      )
                                                    ]?.vote === voteOption.value
                                                      ? voteOption.bgColor
                                                      : isDarkTheme
                                                      ? 'dark'
                                                      : 'light'
                                                  }
                                                  onClick={() => {
                                                    const updatedVote = [
                                                      ...vote,
                                                    ];
                                                    const dataIndex =
                                                      updatedVote.findIndex(
                                                        v =>
                                                          v.id ===
                                                          milestone.id.toString(),
                                                      );
                                                    const arrayIndex =
                                                      dataIndex >= 0
                                                        ? dataIndex
                                                        : updatedVote.length;
                                                    updatedVote[arrayIndex] = {
                                                      vote: voteOption.value,
                                                      id: milestone.id.toString(),
                                                    };
                                                    setVote(updatedVote);
                                                    console.log(vote);
                                                  }}
                                                >
                                                  {voteOption.title}
                                                </Button>
                                              ))}
                                            </ButtonGroup>
                                          )
                                        }
                                        description={
                                          milestone.milestoneDescription
                                        }
                                      />
                                    </div>
                                  );
                                },
                              )}

                              {progressDetail?.projectTermRevision && (
                                <>
                                  <Col xs='12'>
                                    <Row style={{ marginTop: '10px' }}>
                                      <Col
                                        xs='12'
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: 'var(--proposal-text-color)',
                                            fontWeight: 600,
                                          }}
                                        >
                                          Budget Adjustment:
                                        </span>
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Row>
                                    <Col
                                      xs='12'
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <ButtonGroup aria-label='Basic example'>
                                        {voteOptions.map(voteOption => (
                                          <Button
                                            variant={
                                              vote === voteOption.title
                                                ? voteOption.bgColor
                                                : isDarkTheme
                                                ? 'dark'
                                                : 'light'
                                            }
                                            onClick={() =>
                                              setVoteProjectTermRevision(
                                                voteOption.title,
                                              )
                                            }
                                          >
                                            {voteOption.title}
                                          </Button>
                                        ))}
                                      </ButtonGroup>
                                    </Col>
                                  </Row>
                                </>
                              )}
                              <Col
                                xs={24}
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  color: '#ff0000',
                                }}
                              >
                                {error}
                              </Col>

                              {(!votesByProgressReport.some(
                                vote => vote.sponsorAddress === walletAddress,
                              ) ||
                                changeVoteButton) && (
                                <Row style={{ marginTop: '10px' }}>
                                  <Col xs='12'>
                                    <span
                                      style={{
                                        color: 'var(--proposal-text-color)',
                                        fontWeight: 600,
                                      }}
                                    >
                                      Explain in brief the reason behind your
                                      decision:
                                    </span>
                                    <InfoIcon
                                      description={specialCharacterMessage()}
                                    />
                                  </Col>

                                  <Col xs='12'>
                                    <RichTextEditor
                                      initialData={voteReason}
                                      required
                                      onChange={data => setVoteReason(data)}
                                    />
                                    <input
                                      className={styles.fakeInput}
                                      style={{ left: '15px' }}
                                      id='voteReason'
                                    />
                                  </Col>
                                </Row>
                              )}
                              {progressDetail?.isLastProgressReport && (
                                <Alert
                                  variant='info'
                                  style={{ marginTop: '10px' }}
                                >
                                  Note: This is the last progress report for
                                  this proposal.
                                </Alert>
                              )}

                              {(!votesByProgressReport.some(
                                vote => vote.sponsorAddress === walletAddress,
                              ) ||
                                changeVoteButton) && (
                                <Row style={{ justifyContent: 'center' }}>
                                  {!isMaintenanceMode ? (
                                    <Button
                                      variant='primary'
                                      onClick={() => handleVoteSubmission()}
                                      style={{
                                        marginTop: '10px',
                                        width: '150px',
                                      }}
                                    >
                                      Submit Vote
                                    </Button>
                                  ) : (
                                    <Popup
                                      component={
                                        <span className='d-inline-block'>
                                          <Button
                                            variant='info'
                                            type='submit'
                                            disabled
                                            style={{ pointerEvents: 'none' }}
                                          >
                                            SUBMIT
                                          </Button>
                                        </span>
                                      }
                                      popOverText='You can submit a vote after the maintenance period is over.'
                                      placement='left'
                                    />
                                  )}
                                </Row>
                              )}
                            </>
                          }
                          {(!votesByProgressReport.some(
                            vote => vote.sponsorAddress === walletAddress,
                          ) ||
                            !changeVoteButton) && (
                              <>
                                {status === 'Voting' && (
                                  <p
                                    style={{
                                      color: 'var(--font-color)',
                                      textAlign: 'center',
                                    }}
                                  >
                                    You have already voted for this progress
                                    report. <br />{' '}
                                    {changeVote && (
                                      <ButtonGroup
                                        style={{ padding: '10px 0' }}
                                        aria-label='Basic example'
                                      >
                                        <Button
                                          style={{ width: 200 }}
                                          onClick={() =>
                                            setChangeVoteButton(true)
                                          }
                                          variant='primary'
                                        >
                                          Change Vote
                                        </Button>
                                      </ButtonGroup>
                                    )}
                                  </p>
                                )}
                              </>
                            )}
                        </Container>
                      ))}

                    {!sponsorRequest && (
                      <>
                        {/* <Row>
                          <Col xs='12'>
                            {votesByProgressReport?.length ? (
                              <div
                                style={{
                                  marginTop: '12px',
                                  backgroundColor: 'var(--proposal-card-color)',
                                  padding: '12px',
                                }}
                              >
                                <ListTitle>
                                  <div
                                    style={{ padding: '10px', display: 'flex' }}
                                  >
                                    <span
                                      style={{
                                        marginRight: '4px',
                                        color: 'var(--proposal-text-color)',
                                      }}
                                    >
                                      VOTES
                                    </span>
                                    <InfoIcon
                                      description={
                                        'Click on a vote to view more details'
                                      }
                                    />
                                  </div>
                                </ListTitle>
                                <VoteList
                                  votes={votesByProgressReport}
                                  progressReport
                                />
                              </div>
                            ) : null}
                          </Col>
                        </Row> */}

                        <Row>
                          <Col xs='12'>
                            {progressDetail?.projectTermRevision ? (
                              <div
                                style={{
                                  marginTop: '12px',
                                  backgroundColor: 'white',
                                  padding: '12px',
                                }}
                              >
                                <ListTitle>
                                  BUDGET CHANGE REQUEST VOTES
                                </ListTitle>
                                <VoteList
                                  votes={votesByBudgetChange}
                                  progressReport
                                  budgetChange
                                />
                              </div>
                            ) : null}
                          </Col>
                        </Row>
                      </>
                    )}

                    <ConfirmationModal
                      show={sponsorConfirmationShow}
                      onHide={() => setSponsorConfirmationShow(false)}
                      heading={
                        sponsorVote === 'approve'
                          ? 'Sponsor Request Approval Confirmation'
                          : 'Sponsor Request Rejection Confirmation'
                      }
                      onConfirm={
                        sponsorVote === 'approve'
                          ? onClickApproveSponsorRequest
                          : onClickRejectSponsorRequest
                      }
                    >
                      {sponsorVote === 'approve' ? (
                        <>
                          <div>
                            Are you sure you want to approve the sponsor
                            request?
                          </div>
                          <div style={{ color: 'red' }}>
                            You will need to transfer{' '}
                            {progressDetail.totalBudget * 0.1} ICX for sponsor
                            bond.
                          </div>
                        </>
                      ) : (
                        <span>
                          Are you sure you want to reject the sponsor request?
                        </span>
                      )}
                    </ConfirmationModal>

                    <ConfirmationModal
                      show={voteConfirmationShow}
                      onHide={() => setVoteConfirmationShow(false)}
                      heading={'Vote Confirmation'}
                      onConfirm={onSubmitVote}
                    >
                      Are you sure you want to {vote?.title?.toLowerCase()} the
                      progress report?
                    </ConfirmationModal>
                  </Col>

                  {/* <Col lg="4" className = "d-none d-lg-block"> */}
                </Row>
              </Container>
            </Container>
          </>
        )
      )}
    </Container>
  );
}

const mapStateToProps = state => ({
  progressDetail: state.progressReport.progressReportDetail,
  votesByProgressReport: state.progressReport.votesByProgressReport,
  votesByBudgetChange: state.progressReport.votesBudgetChangeByProgressReport,

  approvedPercentage: getProgressReportApprovedPercentage(state),
  approvedVoterPercentage: getProgressReportApprovedVotersPercentage(state),
  rejectedPercentage: getProgressReportRejectedPercentage(state),
  rejectedVotersPercentage: getProgressReportRejectedVotersPercentage(state),

  approvedPercentageBudgetChange: getBudgetAdjustmentApprovedPercentage(state),
  approvedVoterPercentageBudgetChange:
    getBudgetAdjustmentApprovedVotersPercentage(state),

  rejectedPercentageBudgetChange: getBudgetAdjustmentRejectedPercentage(state),
  rejectedVoterPercentageBudgetChange:
    getBudgetAdjustmentRejectedVotersPercentage(state),

  period: state.period.period,
  remainingTime: state.period.remainingTime,
  walletAddress: state.account.address,
  isPrep: state.account.isPrep,
  ipfsError: state.progressReport.ipfsError,
  changeVote: state.progressReport.changeVote,
  votingPRep: state.account.votingPRep,
  isMaintenanceMode: state.fund.isMaintenanceMode,
  selectedProgressReportByIpfs: state.progressReport.selectedProgressReport,
  votingPhase: state.proposals.votingPhase,
});

const mapDispatchToProps = dispatch => ({
  fetchProgressReportDetailRequest: payload =>
    dispatch(fetchProgressReportDetailRequest(payload)),
  approveSponserRequest: payload => dispatch(approveSponserRequest(payload)),
  rejectSponsorRequest: payload => dispatch(rejectSponsorRequest(payload)),
  voteProgressReport: payload => dispatch(voteProgressReport(payload)),
  fetchVoteResultRequest: payload => dispatch(fetchVoteResultRequest(payload)),
  fetchVoteResultBudgetChangeRequest: payload =>
    dispatch(fetchVoteResultBudgetChangeRequest(payload)),
  fetchChangeVoteRequest: payload =>
    dispatch(fetchChangeVoteRequestProgressReport(payload)),
  fetchMaintenanceModeRequest: () => dispatch(fetchMaintenanceModeRequest()),
  fetchProgressReportByIpfsRequest: payload =>
    dispatch(fetchProgressReportByIpfsRequest(payload)),
  emptyProgressReportDetailRequest: payload =>
    dispatch(emptyProgressReportDetailRequest()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProgressReportDetailsPage);
