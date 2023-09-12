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
import styles from './ProposalDetailsPage.module.css';
import ProgressBar from 'Components/UI/ProgressBar';
import ProgressText from 'Components/UI/ProgressText';
import {
  FetchProposalDetailRequest,
  fetchProposalDetailRequest,
  approveSponserRequest,
  rejectSponsorRequest,
  voteProposal,
  fetchVoteResultRequest,
  fetchSponsorMessageRequest,
  fetchChangeVoteRequest,
  VotingPhase,
} from 'Redux/Reducers/proposalSlice';
import {
  emptyProgressReportDetailRequest,
  fetchProgressReportByProposalRequest,
} from 'Redux/Reducers/progressReportSlice';
import { connect, useSelector } from 'react-redux';
import ProgressReportList from 'Components/Card/ProgressReportList';
import {
  proposalStatusMapping,
  specialCharacterMessage,
} from '../../Constants';
import VoteList from 'Components/Card/DetailsModal/VoteList';
import RichTextEditor from 'Components/RichTextEditor';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import {
  getProposalApprovedPercentage,
  getProposalApprovedVotersPercentage,
  getProposalRejectedPercentage,
  getProposalRejectedVotersPercentage,
} from 'Selectors';
import { formatDescription, icxFormat } from 'Helpers';
import DetailsModalPR from 'Components/Card/DetailsModalProgressReport';
import IconService from 'icon-sdk-js';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import { fetchPrepsRequest } from 'Redux/Reducers/prepsSlice';
import useTimer from 'Hooks/useTimer';
import MilestonesTimeline from 'Components/Card/DetailsModal/MilestonesTimeline';
import styled from 'styled-components';
import InfoIcon from 'Components/InfoIcon';
import VoteProgressBar from 'Components/VoteProgressBar';
import { trackerURL } from 'Redux/ICON/utils';
import { NotificationManager } from 'react-notifications';
import Popup from 'Components/Popup';
import { fetchMaintenanceModeRequest } from 'Redux/Reducers/fundSlice';
import {
  fetchProposalListRequest,
  fetchDraftsRequest,
  fetchProposalByIpfsRequest,
  emptyProposalDetailRequest,
} from 'Redux/Reducers/proposalSlice';
import {
  withRouter,
  useLocation,
  useParams,
  useHistory,
} from 'react-router-dom';
import BackButton from 'Components/UI/BackButton';
import '../../Theme/variables.css';
import MilestoneVoteCard from 'Components/MilestoneVotingCard';

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

const DescriptionTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #262626;
  margin-bottom: 5px;
`;

const LoadingDiv = styled.div`
  height: 25vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const sponsorNote = (
  <div className='text-information' style={{ fontSize: '0.9rem' }}>
    <div>Note:</div>
    <div className='intendation'>
      1) If you accept the sponsor request you will need to submit 10% of the
      total budget as sponsor bond.{' '}
    </div>
    <div className='intendation'>
      2) If the proposal gets rejected in the voting period you will get your
      sponsor bond back
    </div>
    <div className='intendation'>
      3) If the proposal gets accepted in the voting period, you will get
      sponsor reward every month for the project duration.{' '}
    </div>
    <div className='intendation'>
      4) If the proposal gets paused (if the progress report for the proposal
      gets rejected), you will stop receiving the sponsor reward.
    </div>
    <div className='intendation'>
      5) If the proposal gets disqualified (if the progress report for the
      proposal gets rejected 2 times in a row), you will stop receiving the
      sponsor reward and will lose the sponsor bond you initially submitted.{' '}
    </div>
  </div>
);

const isDarkTheme = localStorage.getItem('theme') === 'dark';

function ProposalDetailsPage(props) {
  // const isDark = useSelector(state => state.theme.isDark);
  // console.log({ isDark });
  const voteOptions = [
    { title: 'Approve', bgColor: 'success' },
    { title: 'Reject', bgColor: 'danger' },
    { title: 'Abstain', bgColor: 'info' },
  ];
  const [vote, setVote] = useState('');

  const sponsorVoteOptions = [
    { title: 'Accept', bgColor: 'success' },
    { title: 'Deny', bgColor: 'danger' },
  ];
  const [sponsorVote, setSponsorVote] = useState('');

  const [voteReason, setVoteReason] = useState('');
  const [sponsorVoteReason, setSponsorVoteReason] = useState('');
  const [sponsorConfirmationShow, setSponsorConfirmationShow] =
    React.useState(false);
  // const [sponsorVote, setSponsorVote] = useState('');
  const [selectedProgressReport, setSelectedProgressReport] = React.useState();
  const { remainingTime: remainingTimer } = useTimer();

  const [voteConfirmationShow, setVoteConfirmationShow] = React.useState(false);
  const [description, setDescription] = useState(null);
  const [sponsorVoteReasonDescription, setSponsorVoteReasonDescription] =
    useState(null);

  const [error, setError] = useState('');
  const history = useHistory();

  const [loading, setLoading] = useState(true);

  const [changeVoteButton, setChangeVoteButton] = useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const onClickProgressReport = porgressReport => {
    setModalShow(true);
    history.push(`/progress-reports/${porgressReport.ipfsHash}`);
    setSelectedProgressReport(porgressReport);
  };

  const {
    proposalDetail,
    selectedProposalByIpfs,
    sponsorRequest = false,
    approveSponserRequest,
    rejectSponsorRequest,
    voting = false,
    voteProposal,
    progressReportByProposal,
    votesByProposal,
    fetchVoteResultRequest,
    approvedPercentage,
    fetchProgressReportByProposalRequest,
    period,
    remainingTime,
    approvedVoterPercentage,
    fetchProposalDetail,
    walletAddress,
    rejectedPercentage,
    rejectedVoterPercentage,
    fetchPrepsRequest,
    preps,
    sponsorMessage,
    isPrep,
    emptyProgressReportDetailRequest,
    emptyProposalDetailRequest,
    ipfsError,
    changeVote,
    fetchChangeVoteRequest,
    votingPRep,
    isMaintenanceMode,
    fetchMaintenanceModeRequest,
    fetchProposalByIpfsRequest,
    votingPhase,
    ...remainingProps
  } = props;

  const proposalIpfsKey = useParams().id;

  const [proposal, setProposal] = React.useState();
  useEffect(() => {
    if (proposalIpfsKey) {
      fetchProposalByIpfsRequest({
        ipfs_key: proposalIpfsKey,
      });
    }
  }, []);

  useEffect(() => {
    if (selectedProposalByIpfs?.ipfsHash) {
      console.log('Here', { selectedProposalByIpfs });
      setProposal(selectedProposalByIpfs);
      setTimeout(() => {}, 300);
    }
  }, [selectedProposalByIpfs]);

  const status = proposalStatusMapping.find(
    mapping => mapping.status === proposal?._status,
  )?.name;

  const prepName = preps.find(
    prep => prep.address == proposalDetail?.sponserPrep,
  )?.name;

  useEffect(() => {
    fetchPrepsRequest();
  }, []);

  useEffect(() => {
    fetchMaintenanceModeRequest();
  }, [fetchMaintenanceModeRequest]);
  useEffect(() => {
    console.log(
      'sponorRequest',
      sponsorRequest,
      document.getElementById('sponsorVoteReason'),
    );
    if (
      sponsorRequest &&
      status === 'Pending' &&
      period === 'APPLICATION' &&
      remainingTime > 0
    ) {
      if (!sponsorVoteReason) {
        document.getElementById('sponsorVoteReason') &&
          document
            .getElementById('sponsorVoteReason')
            .setCustomValidity(`Please type a reason for your decision.`);
      } else {
        document.getElementById('sponsorVoteReason') &&
          document.getElementById('sponsorVoteReason').setCustomValidity(``);
      }
    }
  }, [sponsorVoteReason, sponsorRequest, status, period, remainingTime]);

  const handleSponsorVoteSubmission = () => {
    if (!sponsorVote) {
      setError('Please cast your vote');
      return;
    }
    if (document.getElementById('sponsorVoteReason').reportValidity()) {
      setError('');
      setSponsorConfirmationShow(true);
    }
  };

  useEffect(() => {
    if (proposalDetail) {
      // setLoading(false);
    }
    let description = formatDescription(proposalDetail?.description);
    setDescription(description);
  }, [proposalDetail?.description]);

  useEffect(() => {
    let description = formatDescription(proposal?.sponsorVoteReason);
    setSponsorVoteReasonDescription(description);
  }, [proposal?.sponsorVoteReason]);

  useEffect(() => {
    console.log(
      'voteReason',
      voting &&
        period === 'VOTING' &&
        remainingTime > 0 &&
        !votesByProposal.some(vote => vote.sponsorAddress === walletAddress),
    );
    if (
      voting &&
      period === 'VOTING' &&
      remainingTime > 0 &&
      !votesByProposal.some(vote => vote.sponsorAddress === walletAddress)
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
    votesByProposal,
    walletAddress,
  ]);

  const handleVoteSubmission = () => {
    if (!vote) {
      setError('Please cast your vote');
      return;
    }
    if (document.getElementById('voteReason').reportValidity()) {
      setError('');
      setVoteConfirmationShow(true);
    }
  };

  // useEffect(() => {
  //   if (status !== 'Pending') {
  //     console.log("STATUSPENDING");
  //     proposal && fetchSponsorMessageRequest({
  //       ipfsKey: proposal.ipfsKey

  //     })
  //   }

  // }, [proposal]);

  useEffect(() => {
    if (proposal && proposal.ipfsHash) {
      emptyProposalDetailRequest();
      emptyProgressReportDetailRequest();
      setLoading(false);

      props.fetchProposalDetail({
        hash: proposal.ipfsHash,
      });
    }
    console.log('I AM HERE', proposal);

    if (status === 'Active' || status === 'Completed' || status === 'Paused') {
      proposal &&
        fetchProgressReportByProposalRequest({
          proposalKey: proposal.ipfsKey,
        });
    }
  }, [proposal]);

  useEffect(() => {
    if (ipfsError) {
      setLoading(false);
      NotificationManager.error('Error fetching ipfs data');
    }
  }, [ipfsError]);

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    // if (status === 'Voting') {
    // alert("Voting");
    proposal &&
      fetchVoteResultRequest({
        proposalKey: proposal.ipfsKey,
      });
    // }
  }, [proposal, props.show, votingPhase]);

  useEffect(() => {
    proposal &&
      fetchChangeVoteRequest({
        ipfs_key: proposal.ipfsKey,
        address: walletAddress,
      });
  }, [proposal]);

  const [voteLoading, setVoteLoading] = React.useState(false);
  const onSubmitVote = () => {
    voteProposal({
      vote,
      voteReason: voteReason.replace(/&nbsp;/g, ''),
      ipfsKey: proposal.ipfsKey,
      vote_change: changeVoteButton ? '1' : '0',
    });
  };

  useEffect(() => {
    if (votingPhase === VotingPhase.IDLE) setVoteLoading(false);
    else setVoteLoading(true);
  }, [votingPhase]);

  const onClickApproveSponsorRequest = () => {
    const { IconConverter } = IconService;
    approveSponserRequest({
      ipfsKey: proposal.ipfsKey,
      proposal: {
        contributorAddress: proposal?._contributor_address,
        title: (proposalDetail && proposalDetail.projectName) || '',
        sponsorAddress: proposalDetail?.sponserPrep,
      },
      sponsorBond: IconConverter.toBigNumber(
        proposalDetail?.totalBudget,
      ).dividedBy(10),
      reason: sponsorVoteReason.replace(/&nbsp;/g, ''),
    });
    // props.onHide();
  };

  const onClickRejectSponsorRequest = () => {
    rejectSponsorRequest({
      ipfsKey: proposal.ipfsKey,
      reason: sponsorVoteReason.replace(/&nbsp;/g, ''),
      proposal: {
        contributorAddress: proposal?._contributor_address,
        title: (proposalDetail && proposalDetail.projectName) || '',
        sponsorAddress: proposalDetail?.sponserPrep,
      },
    });
    // props.onHide();
  };

  return (
    <Container fluid>
      {loading || !proposalDetail ? (
        <Container>
          <LoadingDiv>
            <Spinner animation='border' variant='secondary' />
          </LoadingDiv>
        </Container>
      ) : (
        !ipfsError && (
          <>
            <BackButton onClick={history.goBack}></BackButton>
            <Container className={styles.modalHeader}>
              <Container className={styles.container}>
                <Row xs='12'>
                  <Col>
                    <Header>
                      {(proposalDetail && proposalDetail.projectName) || 'N/A'}
                    </Header>
                  </Col>
                </Row>
                <Row>
                  <Col style={{ flexGrow: 'unset' }}>
                    <Address>{proposal?._contributor_address || 'N/A'}</Address>
                  </Col>
                  <Col>
                    <Badge
                      variant={
                        proposalStatusMapping.find(mapping => {
                          return mapping.name === status;
                        })?.badgeColor
                      }
                    >
                      {status}
                    </Badge>{' '}
                  </Col>
                </Row>
              </Container>

              <Container className={styles.modalBody}>
                <div
                  className=' d-flex flex-column flex-xl-row '
                  style={{
                    width: '100%',
                    gap: '16px',
                  }}
                >
                  <div
                    className='col-12 col-xl-8 order-xl-1 order-2'
                    style={{
                      width: '100%',
                      padding: '0px',
                      wordBreak: 'break-word',
                    }}
                  >
                    <div className={`${styles.description}`}>
                      {/* <div dangerouslySetInnerHTML={{ __html: description }} /> */}
                      <Description
                        description={
                          (proposalDetail && description) ||
                          '<span>No Description</span>'
                        }
                      />
                      {proposal?.sponsorVoteReason && (
                        <Description
                          description={
                            sponsorVoteReasonDescription ||
                            '<span>No Message</span>'
                          }
                          title='Message from Sponsor'
                        />
                      )}
                    </div>

                    {status === 'Voting' && (
                      <Row>
                        <Col xs='12'>
                          <div
                            style={{
                              // textAlign: 'center',
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

                    {proposalDetail?.sponserPrep === walletAddress &&
                      status === 'Pending' &&
                      period === 'APPLICATION' &&
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
                          <Row
                            style={{
                              justifyContent: 'center',
                              flexDirection: 'row',
                            }}
                          >
                            <ButtonGroup aria-label='Basic example'>
                              {sponsorVoteOptions.map(sponsorVoteOption => (
                                <Button
                                  variant={
                                    sponsorVote === sponsorVoteOption.title
                                      ? sponsorVoteOption.bgColor
                                      : 'dark'
                                  }
                                  onClick={() =>
                                    setSponsorVote(sponsorVoteOption.title)
                                  }
                                  // style={
                                  //   isDarkTheme
                                  //     ? {
                                  //         border: '1px solid rgba(0,0,0,0.7)',
                                  //         backgroundColor:
                                  //           'var(--vote-card-btn-color)',
                                  //         color: 'var(--vote-card-text-color)',
                                  //       }
                                  //     : {
                                  //         border: '1px solid rgba(0,0,0,0.7)',
                                  //       }
                                  // }
                                >
                                  {sponsorVoteOption.title}
                                </Button>
                              ))}
                            </ButtonGroup>
                            <Col
                              xs={12}
                              style={{ textAlign: 'center', color: 'red' }}
                            >
                              {error}
                            </Col>
                          </Row>
                          <Row>
                            <Col
                              xs='12'
                              style={{
                                padding: '12px',
                                color: 'var(--card-comment-color)',
                              }}
                            >
                              <span>
                                Explain in brief the reason behind your decision
                              </span>
                              <InfoIcon
                                description={specialCharacterMessage()}
                              />
                            </Col>

                            <Col xs='12'>
                              <RichTextEditor
                                required
                                initialData={sponsorVoteReason}
                                onChange={data => setSponsorVoteReason(data)}
                                // onChange={e => console.log(e)}
                              />
                              <input
                                className={styles.fakeInput}
                                style={{ left: '15px' }}
                                id='sponsorVoteReason'
                              />
                            </Col>
                          </Row>

                          <Alert
                            variant={isDarkTheme ? '' : 'info'}
                            style={{ marginTop: '15px' }}
                          >
                            {sponsorNote}
                          </Alert>

                          <Row style={{ justifyContent: 'center' }}>
                            <Button
                              variant='primary'
                              onClick={() => handleSponsorVoteSubmission()}
                              style={{ marginTop: '10px', width: '199px' }}
                            >
                              Submit Sponsor Vote
                            </Button>
                          </Row>

                          {/* <Row style={{ justifyContent: 'center' }}>
                            <Button variant="success" onClick={onClickApproveSponsorRequest}
                            onClick={() => {
                                setSponsorConfirmationShow(true);
                                setSponsorVote('approve')
                            }}>Accept</Button>
                            <Button variant="danger" className={styles.rejectButton} onClick={onClickRejectSponsorRequest}
                            onClick={() => {
                              setSponsorConfirmationShow(true);
                              setSponsorVote('reject')
                            }}>Deny</Button>
                              
                          </Row> */}
                        </Container>
                      ))}

                    {isPrep &&
                      votingPRep &&
                      period === 'VOTING' &&
                      status === 'Voting' &&
                      remainingTime > 0 && (
                        <>
                          {voteLoading ? (
                            <Container
                              fluid
                              style={{
                                backgroundColor: 'var(--proposal-card-color)',
                              }}
                            >
                              <LoadingDiv>
                                <Spinner
                                  animation='border'
                                  variant='secondary'
                                />
                              </LoadingDiv>
                            </Container>
                          ) : !votesByProposal.some(
                              vote => vote.sponsorAddress === walletAddress,
                            ) || changeVoteButton ? (
                            <Container
                              fluid
                              style={{
                                marginTop: '12px',
                                backgroundColor: 'var(--proposal-card-color)',
                                padding: '12px',
                              }}
                            >
                              {/* <Row
                                style={{
                                  justifyContent: 'center',
                                  flexDirection: 'row',
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
                                      onClick={() => setVote(voteOption.title)}
                                      // style={
                                      //   isDarkTheme
                                      //     ? {
                                      //         border:
                                      //           '1px solid rgba(0,0,0,0.7)',
                                      //       }
                                      //     : {
                                      //         border: '1px solid grey)',
                                      //       }
                                      // }
                                    >
                                      {voteOption.title}
                                    </Button>
                                  ))}
                                </ButtonGroup>
                                <Col
                                  xs={12}
                                  style={{
                                    textAlign: 'center',
                                    color: 'red',
                                  }}
                                >
                                  {error}
                                </Col>
                              </Row> */}
                              {milestoneArray.map((milestone, index) => {
                                return (
                                  <div
                                    id='milestoneArray'
                                    className='d-flex flex-column'
                                  >
                                    <MilestoneVoteCard
                                      id={index + 1}
                                      name={milestone.name}
                                      description={milestone.description}
                                    />
                                  </div>
                                );
                              })}

                              <Row>
                                <Col
                                  xs='12'
                                  style={{
                                    padding: '12px',
                                    color: 'var(--card-comment-color)',
                                  }}
                                >
                                  <span>
                                    Explain in brief the reason behind your
                                    decision
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
                            </Container>
                          ) : (
                            <div>
                              {status === 'Voting' && (
                                <Container
                                  fluid
                                  style={{
                                    marginTop: '12px',
                                    backgroundColor: 'white',
                                    padding: '12px',
                                  }}
                                >
                                  <p
                                    style={{
                                      color: 'var(--proposal-text-color)',
                                      textAlign: 'center',
                                    }}
                                  >
                                    You have already voted for this proposal.{' '}
                                    <br />{' '}
                                    {changeVote && (
                                      <ButtonGroup aria-label='Basic example'>
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
                                </Container>
                              )}
                            </div>
                          )}
                        </>
                      )}

                    {
                      // !sponsorRequest &&
                      <Row>
                        <Col xs='12'>
                          {(status === 'Voting' ||
                            status === 'Active' ||
                            status === 'Completed' ||
                            status === 'Paused' ||
                            status === 'Disqualified' ||
                            status === 'Rejected') &&
                          votesByProposal?.length ? (
                            <div
                              style={{
                                backgroundColor: 'var(--proposal-card-color)',
                                marginTop: '12px',
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
                              <VoteList votes={votesByProposal} />
                            </div>
                          ) : null}
                        </Col>
                        <Col xs='12'>
                          {(status === 'Active' ||
                            status === 'Completed' ||
                            status === 'Paused') && (
                            <div
                              style={{
                                backgroundColor: 'var(--proposal-card-color)',
                                marginTop: '12px',
                                padding: '12px',
                              }}
                            >
                              <ListTitle>PROGRESS REPORTS</ListTitle>
                              <ProgressReportList
                                projectReports={progressReportByProposal}
                                onClickProgressReport={onClickProgressReport}
                                isModal={false}
                                isInsideProposal={true}
                              />
                            </div>
                          )}
                        </Col>
                      </Row>
                    }

                    <ConfirmationModal
                      show={sponsorConfirmationShow}
                      size='lg'
                      onHide={() => setSponsorConfirmationShow(false)}
                      heading={
                        sponsorVote === 'Accept'
                          ? 'Sponsor Request Approval Confirmation'
                          : 'Sponsor Request Rejection Confirmation'
                      }
                      onConfirm={
                        sponsorVote === 'Accept'
                          ? onClickApproveSponsorRequest
                          : onClickRejectSponsorRequest
                      }
                    >
                      {sponsorVote === 'Accept' ? (
                        <>
                          <div>
                            Are you sure you want to accept the sponsor request?
                          </div>
                          {sponsorNote}
                        </>
                      ) : (
                        <span>
                          Are you sure you want to deny the sponsor request?
                        </span>
                      )}
                    </ConfirmationModal>

                    <ConfirmationModal
                      show={voteConfirmationShow}
                      onHide={() => setVoteConfirmationShow(false)}
                      heading={'Vote Confirmation'}
                      onConfirm={onSubmitVote}
                    >
                      Are you sure you want to {vote.toLowerCase()} the
                      proposal?
                    </ConfirmationModal>
                  </div>

                  {/* <Col lg="4" className = "d-none d-lg-block"> */}
                  <div
                    className='d-flex flex-column flex-md-row flex-xl-column order-xl-2 order-1'
                    style={{ height: 'fit-content', gap: '12px' }}
                  >
                    <div
                      className='col-xl-12 col-md-6 col-12'
                      style={{
                        paddingLeft: '0px',
                        paddingRight: '0px',
                      }}
                    >
                      <DetailsTable
                        title={'Project Details'}
                        data={[
                          {
                            key: 'Category',
                            value: proposalDetail?.category || 'N/A',
                          },
                          {
                            key: 'Project Duration',
                            value:
                              `${Number(proposal?.projectDuration)} months` ||
                              'N/A',
                          },
                          {
                            key: 'Total Budget',
                            value:
                              `${icxFormat(proposal?.budget)} ${
                                proposal?.token
                              }` || 'N/A',
                          },
                          {
                            key: 'Sponsor Prep',
                            value: prepName ? (
                              <a
                                href={`${trackerURL}/${proposalDetail?.sponserPrep}`}
                                target='_blank'
                                style={{
                                  color: 'var(--proposal-text-color)',
                                  textDecoration: 'underline',
                                }}
                              >
                                {prepName}
                              </a>
                            ) : (
                              (
                                <a
                                  href={`${trackerURL}/${proposalDetail?.sponserPrep}`}
                                  target='_blank'
                                  style={{
                                    color: 'var(--proposal-text-color)',
                                    textDecoration: 'underline',
                                  }}
                                >{`${proposalDetail?.sponserPrep?.slice(
                                  0,
                                  6,
                                )}...`}</a>
                              ) || 'N/A'
                            ),
                          },
                          {
                            key: 'Team Name',
                            value: `${proposalDetail?.teamName}` || 'N/A',
                          },
                          {
                            key: 'Team Email',
                            value: `${proposalDetail?.teamEmail}` || 'N/A',
                          },
                          {
                            key: 'Team Size',
                            value: `${proposalDetail?.teamSize}` || 'N/A',
                          },
                          {
                            key: 'Submitted On',
                            value: `${new Date(
                              (Number(proposal._sponsored_timestamp) !== 0
                                ? proposal._sponsored_timestamp
                                : proposal._timestamp) / 1000,
                            ).toLocaleDateString()}`,
                          },
                          {
                            key: 'Last Updated On',
                            value: `${new Date(
                              proposal?._timestamp / 1000,
                            ).toLocaleDateString()}`,
                          },

                          ...(['Active', 'Paused'].includes(status)
                            ? [
                                {
                                  key: 'Completed',
                                  value: (
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      {/* <ProgressBar
          percentage={approvedPercentage} /> */}
                                      <ProgressBar
                                        percentage={
                                          proposal?.completedPercentage
                                        }
                                      />

                                      {
                                        // <ProgressText>
                                        //    Stake- {approvedPercentage ? `${approvedPercentage.toFixed()}` : 0}% approved, {rejectedPercentage ? `${rejectedPercentage.toFixed()}` : 0}% rejected
                                        //   </ProgressText>

                                        <Container
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                          }}
                                        >
                                          <ProgressText>
                                            {proposal?.completedPercentage
                                              ? `${proposal?.completedPercentage.toFixed()}`
                                              : 0}
                                            % Completed
                                          </ProgressText>
                                        </Container>
                                      }
                                    </div>
                                  ),
                                },
                              ]
                            : []),

                          ...(['Voting'].includes(status)
                            ? [
                                {
                                  key: 'Stake',
                                  value: (
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      {/* <ProgressBar
                percentage={approvedPercentage} /> */}
                                      <ProgressBarCombined
                                        approvedPercentage={approvedPercentage}
                                        rejectedPercentage={rejectedPercentage}
                                      />

                                      {
                                        // <ProgressText>
                                        //    Stake- {approvedPercentage ? `${approvedPercentage.toFixed()}` : 0}% approved, {rejectedPercentage ? `${rejectedPercentage.toFixed()}` : 0}% rejected
                                        //   </ProgressText>

                                        <Container
                                          style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                          }}
                                        >
                                          <VoteProgressBar
                                            approvedPercentage={
                                              approvedPercentage
                                            }
                                            rejectedPercentage={
                                              rejectedPercentage
                                            }
                                            noProgressBar
                                            placement='bottom'
                                          />
                                        </Container>
                                      }
                                    </div>
                                  ),
                                },
                              ]
                            : []),
                          ...(['Voting'].includes(status)
                            ? [
                                {
                                  key: 'Voter count',
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
                                          approvedVoterPercentage
                                        }
                                        rejectedPercentage={
                                          rejectedVoterPercentage
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
                                            approvedVoterPercentage
                                          }
                                          rejectedPercentage={
                                            rejectedVoterPercentage
                                          }
                                          noProgressBar
                                          voterCount
                                        />
                                      </Container>
                                    </div>
                                  ),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </div>

                    {proposalDetail?.milestones?.length > 0 && (
                      <div
                        className='col-xl-12 col-md-6 col-12'
                        style={{
                          height: 'fit-content',
                          paddingLeft: '0px',
                          paddingRight: '0px',
                          padding: '12px',
                          backgroundColor: 'var(--proposal-card-color)',
                        }}
                      >
                        {/* <MilestoneTable
                  milestones={proposalDetail?.milestones}
                  style={{
                    paddingLeft: '0px',
                    paddingRight: '0px'
                }} /> */}

                        <ListTitle>MILESTONES</ListTitle>
                        <MilestonesTimeline
                          milestones={proposalDetail?.milestones}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* <Row>
                  <Col>
                    <ListTitle>MILESTONES</ListTitle>
                    <MilestonesTimeline
                      milestones={proposalDetail?.milestones}
                    />
                  </Col>
                </Row> */}

                {/* <DetailsModalPR
                                show={true}
                                onHide={() => {
                                    setLoading(false);
                                    emptyProgressReportDetailRequest();
                                }}
                                progressReport={selectedProgressReport}
                                // status={selectedTab}
                            /> */}
              </Container>
            </Container>
          </>
        )
      )}
    </Container>
  );
}

const mapStateToProps = state => ({
  proposalDetail: state.proposals.proposalDetail,
  progressReportByProposal: state.progressReport.progressReportByProposal,
  votesByProposal: state.proposals.votesByProposal,
  approvedPercentage: getProposalApprovedPercentage(state),
  approvedVoterPercentage: getProposalApprovedVotersPercentage(state),

  rejectedPercentage: getProposalRejectedPercentage(state),
  rejectedVoterPercentage: getProposalRejectedVotersPercentage(state),

  period: state.period.period,
  remainingTime: state.period.remainingTime,
  walletAddress: state.account.address,

  preps: state.preps.preps,
  sponsorMessage: state.proposals.sponsorMessage,
  isPrep: state.account.isPrep,
  ipfsError: state.proposals.error,
  changeVote: state.proposals.changeVote,
  votingPRep: state.account.votingPRep,
  isMaintenanceMode: state.fund.isMaintenanceMode,
  selectedProposalByIpfs: state.proposals.selectedProposal,
  votingPhase: state.proposals.votingPhase,
});

const mapDispatchToProps = dispatch => ({
  fetchProposalDetail: payload => dispatch(fetchProposalDetailRequest(payload)),
  approveSponserRequest: payload => dispatch(approveSponserRequest(payload)),
  rejectSponsorRequest: payload => dispatch(rejectSponsorRequest(payload)),
  voteProposal: payload => dispatch(voteProposal(payload)),
  fetchVoteResultRequest: payload => dispatch(fetchVoteResultRequest(payload)),
  fetchProgressReportByProposalRequest: payload =>
    dispatch(fetchProgressReportByProposalRequest(payload)),
  fetchPrepsRequest: payload => dispatch(fetchPrepsRequest(payload)),
  fetchSponsorMessageRequest: payload =>
    dispatch(fetchSponsorMessageRequest(payload)),
  emptyProgressReportDetailRequest: payload =>
    dispatch(emptyProgressReportDetailRequest()),
  fetchChangeVoteRequest: payload => dispatch(fetchChangeVoteRequest(payload)),
  fetchMaintenanceModeRequest: () => dispatch(fetchMaintenanceModeRequest()),
  fetchProposalByIpfsRequest: payload =>
    dispatch(fetchProposalByIpfsRequest(payload)),
  emptyProposalDetailRequest: payload =>
    dispatch(emptyProposalDetailRequest(payload)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProposalDetailsPage);
