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
} from '../../UI/DetailsModal';
import styles from './DetailsModal.module.css';
import ProgressBar from '../../UI/ProgressBar';
import ProgressText from '../../UI/ProgressText';
import {
  FetchProposalDetailRequest,
  fetchProposalDetailRequest,
  approveSponserRequest,
  rejectSponsorRequest,
  voteProposal,
  fetchVoteResultRequest,
  fetchSponsorMessageRequest,
  fetchChangeVoteRequest,
} from 'Redux/Reducers/proposalSlice';
import {
  emptyProgressReportDetailRequest,
  fetchProgressReportByProposalRequest,
} from 'Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import ProgressReportList from 'Components/Card/ProgressReportList';
import {
  proposalStatusMapping,
  specialCharacterMessage,
} from '../../../Constants';
import VoteList from './VoteList';
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

const DescriptionTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #262626;
  margin-bottom: 5px;
`;

const LoadingDiv = styled.div`
  height: 50vh;
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

function DetailsModal(props) {
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
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedProgressReport, setSelectedProgressReport] = React.useState();
  const { remainingTime: remainingTimer } = useTimer();

  const [voteConfirmationShow, setVoteConfirmationShow] = React.useState(false);
  const [description, setDescription] = useState(null);
  const [sponsorVoteReasonDescription, setSponsorVoteReasonDescription] =
    useState(null);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);

  const [changeVoteButton, setChangeVoteButton] = useState(false);

  const {
    proposalDetail,
    proposal,
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
    sponsorBondPercentage,
    fetchProposalDetail,
    walletAddress,
    rejectedPercentage,
    rejectedVoterPercentage,
    fetchPrepsRequest,
    preps,
    sponsorMessage,
    isPrep,
    emptyProgressReportDetailRequest,
    ipfsError,
    changeVote,
    fetchChangeVoteRequest,
    votingPRep,
    isMaintenanceMode,
    fetchMaintenanceModeRequest,
    ...remainingProps
  } = props;

  const status = proposalStatusMapping.find(
    mapping => mapping.status === proposal?._status,
  )?.name;

  const prepName = proposalDetail?.sponserPrepName
    ? proposalDetail?.sponserPrepName
    : preps.find(prep => prep.address == proposalDetail?.sponserPrep)?.name;

  useEffect(() => {
    // console.log(
    //   'sponsorConfirmationShow',
    //   sponsorConfirmationShow,
    //   modalShow,
    //   modalShow || sponsorConfirmationShow,
    // );
  }, [sponsorConfirmationShow, modalShow]);
  const onClickProgressReport = porgressReport => {
    setModalShow(true);
    setSelectedProgressReport(porgressReport);
  };

  useEffect(() => {
    fetchPrepsRequest();
  }, []);

  useEffect(() => {
    fetchMaintenanceModeRequest();
  }, [fetchMaintenanceModeRequest]);

  useEffect(() => {
    // console.log(
    //   'sponorRequest',
    //   sponsorRequest,
    //   document.getElementById('sponsorVoteReason'),
    // );
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
      setLoading(false);
    }
    let description = formatDescription(proposalDetail?.description);
    setDescription(description);
  }, [proposalDetail?.description]);

  useEffect(() => {
    let description = formatDescription(proposal?.sponsorVoteReason);
    setSponsorVoteReasonDescription(description);
  }, [proposal?.sponsorVoteReason]);

  useEffect(() => {
    // console.log(
    //   'voteReason',
    //   voting &&
    //     period === 'VOTING' &&
    //     remainingTime > 0 &&
    //     !votesByProposal.some(vote => vote.sponsorAddress === walletAddress),
    // );
    if (
      voting &&
      period === 'VOTING' &&
      remainingTime > 0 &&
      !votesByProposal.some(vote => vote.sponsorAddress === walletAddress)
    ) {
      // console.log('voteReasonhere', document.getElementById('voteReason'));
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
  //     props.proposal && fetchSponsorMessageRequest({
  //       ipfsKey: props.proposal.ipfsKey

  //     })
  //   }

  // }, [props.proposal]);

  useEffect(() => {
    props.proposal &&
      props.fetchProposalDetail({
        hash: props.proposal.ipfsHash,
      });

    if (status === 'Active' || status === 'Completed' || status === 'Paused') {
      props.proposal &&
        fetchProgressReportByProposalRequest({
          proposalKey: props.proposal.ipfsKey,
        });
    }
  }, [props.proposal]);

  useEffect(() => {
    if (ipfsError) {
      setLoading(false);
      props.onHide();
      NotificationManager.error('Error fetching ipfs data');
    }
  }, [ipfsError]);

  useEffect(() => {
    // if (status === 'Voting') {
    // alert("Voting");
    props.proposal &&
      fetchVoteResultRequest({
        proposalKey: props.proposal.ipfsKey,
      });
    // }
  }, [props.proposal, props.show]);

  useEffect(() => {
    props.proposal &&
      fetchChangeVoteRequest({
        ipfs_key: props.proposal.ipfsKey,
        address: walletAddress,
      });
  }, [props.proposal]);

  const onSubmitVote = () => {
    voteProposal({
      vote,
      voteReason: voteReason.replace(/&nbsp;/g, ''),
      ipfsKey: proposal.ipfsKey,
      vote_change: changeVoteButton ? '1' : '0',
    });
  };

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
      ).multipliedBy(sponsorBondPercentage),
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
    <Modal
      {...remainingProps}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      {loading ? (
        <LoadingDiv>
          <Spinner animation='border' variant='secondary' />
        </LoadingDiv>
      ) : (
        !ipfsError && (
          <>
            <Modal.Header
              closeButton
              className={styles.modalHeader}
              style={
                modalShow || sponsorConfirmationShow
                  ? { backgroundColor: '#DDDDDD' }
                  : {}
              }
            >
              <Container fluid className={styles.container}>
                <Row>
                  <Col sm='12'>
                    <Header>
                      {(proposalDetail && proposalDetail.projectName) || 'N/A'}
                    </Header>
                  </Col>
                </Row>
                <Row>
                  <Col sm='12'>
                    <Address>{proposal?._contributor_address || 'N/A'}</Address>
                  </Col>
                </Row>
                <Row style={{ alignItems: 'center' }}>
                  <Col lg='1' xs='12'>
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

                  {(selectedTab => {
                    // console.log(props.selectedTab);
                    if (['Active', 'Paused'].includes(status))
                      return (
                        <>
                          <Col lg='3' xs='12'>
                            <ProgressBar
                              percentage={proposal?.completedPercentage}
                            />
                          </Col>

                          <Col
                            lg='8'
                            xs='12'
                            className={styles.progressTextContainer}
                          >
                            {
                              <ProgressText>
                                {proposal?.completedPercentage
                                  ? `${proposal?.completedPercentage.toFixed()}`
                                  : 0}
                                % Completed
                              </ProgressText>
                            }
                          </Col>
                        </>
                      );
                    if (['Voting'].includes(status))
                      return (
                        <>
                          {/* <Col xs="12"> */}
                          <Col lg='3' xs='12'>
                            {/* <ProgressBar
                          percentage={approvedPercentage} /> */}

                            <ProgressBarCombined
                              approvedPercentage={approvedPercentage}
                              rejectedPercentage={rejectedPercentage}
                            />
                          </Col>

                          <Col
                            lg='8'
                            xs='12'
                            className={styles.progressTextContainer}
                          >
                            {
                              // <ProgressText>
                              //   Stake- {approvedPercentage ? `${approvedPercentage.toFixed()}` : 0}% approved, {rejectedPercentage ? `${rejectedPercentage.toFixed()}` : 0}% rejected
                              //   <InfoIcon description="The category the project falls into" />

                              //   </ProgressText>

                              <VoteProgressBar
                                approvedPercentage={approvedPercentage}
                                rejectedPercentage={rejectedPercentage}
                                noProgressBar
                                proposal
                                placement='bottom'
                              />
                            }
                          </Col>
                          {/* </Col> */}
                          <Col lg='1' xs='12'></Col>
                          <Col lg='3' xs='12'>
                            {/* <ProgressBar
                          percentage={approvedVoterPercentage} /> */}

                            <ProgressBarCombined
                              approvedPercentage={approvedVoterPercentage}
                              rejectedPercentage={rejectedVoterPercentage}
                            />
                          </Col>

                          <Col
                            lg='8'
                            xs='12'
                            className={styles.progressTextContainer}
                          >
                            {
                              // <ProgressText>
                              //   Voter count- {approvedVoterPercentage ? `${approvedVoterPercentage.toFixed()}` : 0}% approved, {rejectedVoterPercentage ? `${rejectedVoterPercentage.toFixed()}` : 0}% rejected
                              // </ProgressText>

                              <VoteProgressBar
                                approvedPercentage={approvedVoterPercentage}
                                rejectedPercentage={rejectedVoterPercentage}
                                noProgressBar
                                proposal
                                voterCount
                                placement='bottom'
                              />
                            }
                          </Col>
                        </>
                      );
                    else return null;
                  })()}
                </Row>
              </Container>
            </Modal.Header>
            <Modal.Body
              className={styles.modalBody}
              style={modalShow ? { backgroundColor: '#DDDDDD' } : {}}
            >
              <Row>
                <Col lg='8' xs='12'>
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
                </Col>

                {/* <Col lg="4" className = "d-none d-lg-block"> */}
                <Col lg='4' xs='12'>
                  <Col
                    xs='12'
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
                          value: `${proposal?.projectDuration} months` || 'N/A',
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
                                color: '#262626',
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
                                  color: '#262626',
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
                      ]}
                    />
                  </Col>
                  {proposalDetail?.milestones?.length > 0 && (
                    <Col
                      xs='12'
                      style={{
                        paddingLeft: '0px',
                        paddingRight: '0px',
                      }}
                    >
                      {/* <MilestoneTable
                  milestones={proposalDetail?.milestones}
                  style={{
                    paddingLeft: '0px',
                    paddingRight: '0px'
                  }} /> */}
                    </Col>
                  )}
                </Col>
              </Row>

              <Row>
                <Col>
                  <ListTitle>MILESTONES</ListTitle>
                  <MilestonesTimeline milestones={proposalDetail?.milestones} />
                </Col>
              </Row>

              {status === 'Voting' && (
                <Row>
                  <Col xs='12'>
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#262626',
                        marginBottom: '5px',
                        fontSize: '1rem',
                      }}
                    >
                      <>
                        {period !== 'VOTING'
                          ? 'Voting starts in '
                          : 'Voting ends in '}
                      </>
                      <b>{remainingTimer.day}</b> days{' '}
                      <b>{remainingTimer.hour}</b> hours{' '}
                      <b>{remainingTimer.minute}</b> minutes{' '}
                      <b>{remainingTimer.second}</b> seconds
                    </div>
                  </Col>
                </Row>
              )}

              {proposalDetail?.sponserPrep === walletAddress &&
                status === 'Pending' &&
                period === 'APPLICATION' &&
                remainingTime > 0 && (
                  <>
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
                                : 'light'
                            }
                            onClick={() =>
                              setSponsorVote(sponsorVoteOption.title)
                            }
                            // style={{ border: '1px solid rgba(0,0,0,0.7)' }}
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
                      <Col xs='12'>
                        <span>
                          Explain in brief the reason behind your decision
                        </span>
                        <InfoIcon description={specialCharacterMessage()} />
                      </Col>

                      <Col xs='12'>
                        <RichTextEditor
                          required
                          initialData={sponsorVoteReason}
                          onChange={data => setSponsorVoteReason(data)}
                        />
                        <input
                          className={styles.fakeInput}
                          style={{ left: '15px' }}
                          id='sponsorVoteReason'
                        />
                      </Col>
                    </Row>

                    <Alert variant={'info'} style={{ marginTop: '15px' }}>
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
                  </>
                )}

              {isPrep &&
                votingPRep &&
                period === 'VOTING' &&
                remainingTime > 0 && (
                  <>
                    {!votesByProposal.some(
                      vote => vote.sponsorAddress === walletAddress,
                    ) || changeVoteButton ? (
                      <>
                        <Row
                          style={{
                            justifyContent: 'center',
                            flexDirection: 'row',
                          }}
                        >
                          {/* {milestoneArray.map((milestone, index) => {
                            return (
                              <div className='d-flex flex-column'>
                                <MilestoneVoteCard
                                  id={index + 1}
                                  name={milestone.name}
                                  description={milestone.description}
                                />
                              </div>
                            );
                          })} */}
                          <ButtonGroup aria-label='Basic example'>
                            {voteOptions.map(voteOption => (
                              <Button
                                variant={
                                  vote === voteOption.title
                                    ? voteOption.bgColor
                                    : 'light'
                                }
                                onClick={() => setVote(voteOption.title)}
                                style={{ border: '1px solid rgba(0,0,0,0.7)' }}
                              >
                                {voteOption.title}
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
                          <Col xs='12'>
                            <span>
                              Explain in brief the reason behind your decision
                            </span>
                            <InfoIcon description={specialCharacterMessage()} />
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
                              style={{ marginTop: '10px', width: '150px' }}
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
                      </>
                    ) : (
                      <>
                        {status === 'Voting' && (
                          <p style={{ color: '#262626', textAlign: 'center' }}>
                            You have already voted for this proposal. <br />{' '}
                            {changeVote && (
                              <ButtonGroup aria-label='Basic example'>
                                <Button
                                  style={{ width: 200 }}
                                  onClick={() => setChangeVoteButton(true)}
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
                  </>
                )}

              {
                // !sponsorRequest &&
                <Row>
                  <Col xs='12'>
                    {status === 'Voting' ||
                    status === 'Active' ||
                    status === 'Completed' ||
                    status === 'Paused' ||
                    status === 'Disqualified' ||
                    (status === 'Rejected' && votesByProposal?.length) ? (
                      <>
                        <ListTitle>VOTES</ListTitle>
                        <VoteList votes={votesByProposal} />
                      </>
                    ) : null}
                    {(status === 'Active' ||
                      status === 'Completed' ||
                      status === 'Paused') && (
                      <>
                        <ListTitle>Progress Reports</ListTitle>
                        <ProgressReportList
                          projectReports={progressReportByProposal}
                          onClickProgressReport={onClickProgressReport}
                          isModal
                        />
                      </>
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
                Are you sure you want to {vote.toLowerCase()} the proposal?
              </ConfirmationModal>

              {modalShow && (
                <DetailsModalPR
                  show={modalShow}
                  onHide={() => {
                    setLoading(false);
                    emptyProgressReportDetailRequest();
                    setModalShow(false);
                  }}
                  progressReport={selectedProgressReport}
                  // status={selectedTab}
                />
              )}
            </Modal.Body>
          </>
        )
      )}
    </Modal>
  );
}

const mapStateToProps = state => ({
  proposalDetail: state.proposals.proposalDetail,
  progressReportByProposal: state.progressReport.progressReportByProposal,
  votesByProposal: state.proposals.votesByProposal,
  approvedPercentage: getProposalApprovedPercentage(state),
  approvedVoterPercentage: getProposalApprovedVotersPercentage(state),
  sponsorBondPercentage: state.preps.sponsorBondPercentage,
  rejectedPercentage: getProposalRejectedPercentage(state),
  rejectedVoterPercentage: getProposalRejectedVotersPercentage(state),

  period: state.period.period,
  remainingTime: state.period.remainingTime,
  walletAddress: state.account.address,

  preps: state.preps.preps,
  sponsorMessage: state.proposals.sponsorMessage,
  walletAddress: state.account.address,
  isPrep: state.account.isPrep,
  ipfsError: state.proposals.error,
  changeVote: state.proposals.changeVote,
  votingPRep: state.account.votingPRep,
  isMaintenanceMode: state.fund.isMaintenanceMode,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(DetailsModal);
