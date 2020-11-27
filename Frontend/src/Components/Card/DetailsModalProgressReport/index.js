import React, { useEffect, useState } from 'react';
import { Modal, Button, Col, Row, Container, Badge, ButtonGroup } from 'react-bootstrap';
import { Header, Address, DetailsTable, Description, MilestoneTable, ListTitle } from '../../UI/DetailsModal';
import styles from './DetailsModal.module.css';
import ProgressBar from '../../UI/ProgressBar';
import ProgressText from '../../UI/ProgressText';
import {
  fetchProgressReportDetailRequest,
  // approveSponserRequest, rejectSponsorRequest, voteProposal 
} from 'Redux/Reducers/progressReportSlice';
import { approveSponserRequest, rejectSponsorRequest, voteProposal } from 'Redux/Reducers/proposalSlice';
import { voteProgressReport, fetchVoteResultRequest, fetchVoteResultBudgetChangeRequest } from 'Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import ProgressReportList from './ProgressReportList';
import { progressReportStatusMapping } from '../../../Constants';
import VoteList from '../DetailsModal/VoteList';
import RichTextEditor from 'Components/RichTextEditor';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import {
  getProgressReportApprovedPercentage, getProgressReportApprovedVotersPercentage,
  getBudgetAdjustmentApprovedPercentage, getBudgetAdjustmentApprovedVotersPercentage
} from 'Selectors';

function DetailsModal(props) {

  const voteOptions = ['Approve', 'Reject'];
  const [vote, setVote] = useState(voteOptions[0]);
  const [voteProjectTermRevision, setVoteProjectTermRevision] = useState(voteOptions[0]);

  const [voteReason, setVoteReason] = useState('');
  const [sponsorConfirmationShow, setSponsorConfirmationShow] = React.useState(false);
  const [sponsorVote, setSponsorVote] = useState('');


  const [voteConfirmationShow, setVoteConfirmationShow] = React.useState(false);


  const { progressDetail, proposal, sponsorRequest = false, approveSponserRequest, rejectSponsorRequest, voting = false, voteProgressReport, progressReport, votesByProposal, fetchVoteResultRequest, approvedPercentage,
    period, remainingTime, approvedVoterPercentage, fetchProgressReportDetailRequest, walletAddress, fetchVoteResultBudgetChangeRequest, approvedPercentageBudgetChange, approvedVoterPercentageBudgetChange, votesByBudgetChange, ...remainingProps } = props;

  const status = progressReportStatusMapping.find(mapping => mapping.status === progressReport?.status)?.name

  useEffect(() => {
    props.progressReport && props.fetchProgressReportDetailRequest(
      {
        hash: props.progressReport.ipfsHash
      }
    );



  }, [props.progressReport])


  useEffect(() => {
    if (status === 'Voting') {
      // alert("Voting");
      props.progressReport && fetchVoteResultRequest({
        reportKey: progressReport.reportKey
      });

      props.progressReport && fetchVoteResultBudgetChangeRequest({
        reportKey: progressReport.reportKey
      });
    }
  }, [props.progressReport, props.show])

  const onSubmitVote = () => {
    voteProgressReport(
      {
        vote,
        voteReason,
        voteProjectTermRevision: progressDetail?.projectTermRevision ? voteProjectTermRevision : null,
        proposalKey: progressReport.proposalKey,
        reportKey: progressReport.reportKey

      }
    )
  }

  const onClickApproveSponsorRequest = () => {
    approveSponserRequest(
      {
        // ipfsKey: proposal.ipfsKey,
        // sponsorBond: proposalDetail.totalBudget * 0.1
      }
    );
    // props.onHide();
  }

  const onClickRejectSponsorRequest = () => {
    rejectSponsorRequest(
      {
        // ipfsKey: proposal.ipfsKey,
      }
    );
    // props.onHide();

  }

  return (
    <Modal
      {...remainingProps}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Container fluid className={styles.container}>
          <Row>
            <Col sm="12">
              <Header>
                {progressDetail && progressDetail.progressReportTitle || 'N/A'}
              </Header>
            </Col>
          </Row>
          <Row>

            <Col sm="12">

              <Address>
                Project Name- {progressDetail?.progressReportTitle || 'N/A'}
              </Address>
            </Col>
          </Row>
          <Row style={{ alignItems: 'center' }}>
            <Col lg="1" xs="12">
              <Badge variant={progressReportStatusMapping.find((mapping) => {
                return (mapping.name === status)
              })?.badgeColor}>{status}</Badge>{' '}
            </Col>

            {
              ((selectedTab) => {
                console.log(props.selectedTab);
                // if (['Active', 'Paused'].includes(props.status))
                //   return (
                //     <>
                //       <Col lg="3" xs="12">

                //         <ProgressBar />
                //       </Col>

                //       <Col lg="3" xs="12" className={styles.progressTextContainer}>
                //         {

                //           <ProgressText>
                //             46% Completed
                //             </ProgressText>
                //         }

                //       </Col>
                //     </>
                //   )
                if (['Voting'].includes(status))
                  return (
                    <>
                      <Col lg="3" xs="12">

                        <ProgressBar
                          percentage={approvedPercentage} />
                      </Col>

                      <Col lg="8" xs="12" className={styles.progressTextContainer}>
                        {

                          <ProgressText>
                            {approvedPercentage ? `${approvedPercentage.toFixed()}` : 0}% Stake Approved
                            </ProgressText>
                        }

                      </Col>

                      <Col lg='1' xs='12'></Col>
                      <Col lg="3" xs="12">

                        <ProgressBar
                          percentage={approvedVoterPercentage} />
                      </Col>

                      <Col lg="8" xs="12" className={styles.progressTextContainer}>
                        {

                          <ProgressText>
                            {approvedVoterPercentage ? `${approvedVoterPercentage.toFixed()}` : 0}% Voter Count Approved
                          </ProgressText>
                        }

                      </Col>



                      {
                        progressDetail?.projectTermRevision && 
                        <>
                                              <Col lg='1' xs='12'></Col>
                      <Col lg="3" xs="12">

                        <ProgressBar
                          percentage={approvedPercentageBudgetChange} />
                      </Col>

                      <Col lg="8" xs="12" className={styles.progressTextContainer}>
                        {

                          <ProgressText>
                            {approvedPercentageBudgetChange ? `${approvedPercentageBudgetChange.toFixed()}` : 0}% Stake Approved (Budget Change Request)
                          </ProgressText>
                        }

                      </Col>

                        </>
                      }

                      {
                        progressDetail?.projectTermRevision && 
                        <>
                                              <Col lg='1' xs='12'></Col>
                      <Col lg="3" xs="12">

                        <ProgressBar
                          percentage={approvedVoterPercentageBudgetChange} />
                      </Col>

                      <Col lg="8" xs="12" className={styles.progressTextContainer}>
                        {

                          <ProgressText>
                            {approvedVoterPercentageBudgetChange ? `${approvedVoterPercentageBudgetChange.toFixed()}` : 0}% Voter Count Approved (Budget Change Request)
                          </ProgressText>
                        }

                      </Col>

                        </>
                      }
                    </>
                  )
                else
                  return null;
              }
              )()

            }

          </Row>
        </Container>

      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <Row>
          <Col lg="8" xs="12">
            {/* <div dangerouslySetInnerHTML={{ __html: description }} /> */}
            <Description description={(progressDetail && progressDetail.description) || '<span>No Description</span>'} />
            {
              progressDetail && progressDetail.projectTermRevision ?
                <Description description={(progressDetail && progressDetail.revisionDescription) || '<span>No Description</span>'}
                  title="REVISION DESCRIPTION" /> : null
            }


          </Col>

          {/* <Col lg="4" className = "d-none d-lg-block"> */}
          <Col lg="4" xs="12">
            <Col xs="12" style={{
              paddingLeft: '0px',
              paddingRight: '0px'
            }}>
              <DetailsTable
                title={"Project Details"}
                data={
                  [
                    {
                      key: 'Percentage Completed',
                      value: progressDetail?.percentageCompleted ? `${progressDetail?.percentageCompleted}%` : 'N/A'
                    },
                    {
                      key: 'Time Remaining',
                      value: progressDetail?.timeRemainingToCompletion ? `${progressDetail?.timeRemainingToCompletion} months` : 'N/A'
                    },
                  ]
                }
              />
            </Col>
            {
              (progressDetail?.projectTermRevision) &&
              <Col xs="12" style={{
                paddingLeft: '0px',
                paddingRight: '0px'
              }}>
                <DetailsTable
                  title={"Project Term Revision"}
                  data={
                    [
                      {
                        key: 'Additional Budget',
                        value: progressDetail?.additionalBudget ? `${progressDetail?.additionalBudget} ICX` : 'N/A'
                      },
                      {
                        key: 'Additional Time',
                        value: progressDetail?.additionalTime ? `${progressDetail?.additionalTime} months` : 'N/A'
                      },
                    ]
                  }
                />
              </Col>
            }
          </Col>
        </Row>

        {
          sponsorRequest && (status === 'Pending') &&
          <Row style={{ justifyContent: 'center' }}>
            <Button variant="success" onClick={onClickApproveSponsorRequest}
              onClick={() => {
                setSponsorConfirmationShow(true);
                setSponsorVote('approve')
              }}>Approve</Button>
            <Button variant="danger" className={styles.rejectButton} onClick={onClickRejectSponsorRequest}
              onClick={() => {
                setSponsorConfirmationShow(true);
                setSponsorVote('reject')
              }}>Reject</Button>

          </Row>
        }

        {
          voting && (period === 'VOTING') && (remainingTime > 0) &&
          <>
            {
              !votesByProposal.some(vote => vote.sponsorAddress === walletAddress) ?

                <>
                  {
                    progressDetail?.projectTermRevision &&
                    <Row>
                      <Col xs="12" style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ color: '#262626', fontWeight: 600 }}>Progress Report:</span>

                      </Col>
                    </Row>
                  }

                  <Row>
                    <Col xs="12" style={{ display: 'flex', justifyContent: 'center' }}>
                      <ButtonGroup aria-label="Basic example">

                        {
                          voteOptions.map(voteOption =>
                            <Button variant={vote === voteOption ? 'success' : 'light'} onClick={() => setVote(voteOption)}>{voteOption}</Button>
                          )

                        }
                      </ButtonGroup>
                    </Col>

                  </Row>

                  {
                    progressDetail?.projectTermRevision &&
                    <>
                      <Col xs="12">

                        <Row style={{ marginTop: '10px' }}>
                          <Col xs='12' style={{ display: 'flex', justifyContent: 'center' }}>
                            <span style={{ color: '#262626', fontWeight: 600 }}>Budget Adjustment:</span>
                          </Col>
                        </Row>
                      </Col>

                      <Row>
                        <Col xs="12" style={{ display: 'flex', justifyContent: 'center' }}>

                          <ButtonGroup aria-label="Basic example">

                            {
                              voteOptions.map(voteOption =>
                                <Button variant={voteProjectTermRevision === voteOption ? 'success' : 'light'} onClick={() => setVoteProjectTermRevision(voteOption)}>{voteOption}</Button>
                              )

                            }
                          </ButtonGroup>
                        </Col>

                      </Row>
                    </>
                  }

                  <Row style={{ marginTop: '10px' }}>
                    <Col xs="12">
                      <span style={{ color: '#262626', fontWeight: 600 }}>Explain in brief the reason behind your decision:</span>
                    </Col>

                    <Col xs="12">
                      <RichTextEditor
                        required
                        onChange={(data) =>
                          setVoteReason(
                            data
                          )} />
                    </Col>

                  </Row>

                  <Row style={{ justifyContent: 'center' }}>
                    <Button variant="primary" onClick={() => setVoteConfirmationShow(true)} style={{ marginTop: '10px', width: '150px' }}>Submit Vote</Button>

                  </Row>
                </> :
                <>
                  <p style={{ color: '#262626', textAlign: 'center' }}>You have already voted for this progress report</p>

                </>
            }
          </>
        }

        {
          !sponsorRequest &&
          <>
          <Row>
            <Col xs="12">
              {
                (status === 'Voting') ?
                  <>
                    <ListTitle>VOTES</ListTitle>
                    <VoteList
                      votes={votesByProposal}
                      progressReport />
                  </> :
                  (
                    null
                  )
              }

            </Col>
          </Row>

          <Row>
            <Col xs="12">
              {
                (status === 'Voting' && progressDetail?.projectTermRevision) ?
                  <>
                    <ListTitle>BUDGET CHANGE REQUEST VOTES</ListTitle>
                    <VoteList
                      votes={votesByBudgetChange}
                      progressReport />
                  </> :
                  (
                    null
                  )
              }

            </Col>
          </Row>
          </>
            }

        <ConfirmationModal
          show={sponsorConfirmationShow}
          onHide={() => setSponsorConfirmationShow(false)}
          heading={sponsorVote === 'approve' ? 'Sponsor Request Approval Confirmation' : 'Sponsor Request Rejection Confirmation'}
          onConfirm={sponsorVote === 'approve' ?
            onClickApproveSponsorRequest : onClickRejectSponsorRequest} >
          {
            (sponsorVote === 'approve') ?
              <>
                <div>Are you sure you want to approve the sponsor request?</div>
                <div style={{ color: 'red' }}>You will need to transfer {progressDetail.totalBudget * 0.1} ICX for sponsor bond.</div>
              </> :
              <span>Are you sure you want to reject the sponsor request?</span>
          }

        </ConfirmationModal>

        <ConfirmationModal
          show={voteConfirmationShow}
          onHide={() => setVoteConfirmationShow(false)}
          heading={'Vote Confirmation'}
          onConfirm={onSubmitVote} >
          Are you sure you want to {vote} the proposal?
        </ConfirmationModal>

      </Modal.Body>
    </Modal>
  );
}

const mapStateToProps = state => (
  {
    progressDetail: state.progressReport.progressReportDetail,
    votesByProposal: state.progressReport.votesByProgressReport,
    votesByBudgetChange: state.progressReport.votesBudgetChangeByProgressReport,

    approvedPercentage: getProgressReportApprovedPercentage(state),
    approvedVoterPercentage: getProgressReportApprovedVotersPercentage(state),

    approvedPercentageBudgetChange: getBudgetAdjustmentApprovedPercentage(state),
    approvedVoterPercentageBudgetChange: getBudgetAdjustmentApprovedVotersPercentage(state),

    period: state.period.period,
    remainingTime: state.period.remainingTime,
    walletAddress: state.account.address

  }
)

const mapDispatchToProps = (dispatch) => (
  {
    fetchProgressReportDetailRequest: payload => dispatch(fetchProgressReportDetailRequest(payload)),
    approveSponserRequest: payload => dispatch(approveSponserRequest(payload)),
    rejectSponsorRequest: payload => dispatch(rejectSponsorRequest(payload)),
    voteProgressReport: payload => dispatch(voteProgressReport(payload)),
    fetchVoteResultRequest: payload => dispatch(fetchVoteResultRequest(payload)),
    fetchVoteResultBudgetChangeRequest: payload => dispatch(fetchVoteResultBudgetChangeRequest(payload))

  }
)

export default connect(mapStateToProps, mapDispatchToProps)(DetailsModal);