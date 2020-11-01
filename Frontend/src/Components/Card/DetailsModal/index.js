import React, { useEffect, useState } from 'react';
import { Modal, Button, Col, Row, Container, Badge, ButtonGroup } from 'react-bootstrap';
import { Header, Address, DetailsTable, Description, MilestoneTable, ListTitle } from '../../UI/DetailsModal';
import styles from './DetailsModal.module.css';
import ProgressBar from '../../UI/ProgressBar';
import ProgressText from '../../UI/ProgressText';
import { FetchProposalDetailRequest, fetchProposalDetailRequest, approveSponserRequest, rejectSponsorRequest, voteProposal, fetchVoteResultRequest } from 'Redux/Reducers/proposalSlice';
import { fetchProgressReportByProposalRequest } from 'Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import ProgressReportList from './ProgressReportList';
import { proposalStatusMapping } from '../../../Constants';
import VoteList from './VoteList';
import RichTextEditor from 'Components/RichTextEditor';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { getProposalApprovedPercentage, getProposalApprovedVotersPercentage } from 'Selectors';
import {icxFormat} from 'helpers';

function DetailsModal(props) {

  const voteOptions = ['Approve', 'Reject', 'Abstain'];
  const [vote, setVote] = useState(voteOptions[0]);
  const [voteReason, setVoteReason] = useState('');
  const [sponsorConfirmationShow, setSponsorConfirmationShow] = React.useState(false);
  const [sponsorVote, setSponsorVote] = useState('');


  const [voteConfirmationShow, setVoteConfirmationShow] = React.useState(false);


  const { proposalDetail, proposal, status, sponsorRequest = false, approveSponserRequest, rejectSponsorRequest, voting = false, voteProposal, progressReportByProposal, votesByProposal, fetchVoteResultRequest, approvedPercentage,
    fetchProgressReportByProposalRequest, period, remainingTime, approvedVoterPercentage, fetchProposalDetail, ...remainingProps } = props;

  useEffect(() => {
    props.proposal && props.fetchProposalDetail(
      {
        hash: props.proposal.ipfsHash
      }
    );


    if (status === 'Active' || status === 'Completed' || status === 'Paused') {
      props.proposal && fetchProgressReportByProposalRequest({
        proposalKey: props.proposal.ipfsKey
      })
    }


  }, [props.proposal])

  useEffect(() => {
    if (status === 'Voting') {
      // alert("Voting");
      props.proposal && fetchVoteResultRequest({
        proposalKey: props.proposal.ipfsKey
      });
    }
  }, [props.proposal, props.show])

  const onSubmitVote = () => {
    voteProposal(
      {
        vote,
        voteReason,
        ipfsKey: proposal.ipfsKey,

      }
    )
  }

  const onClickApproveSponsorRequest = () => {
    approveSponserRequest(
      {
        ipfsKey: proposal.ipfsKey,
        sponsorBond: proposalDetail.totalBudget * 0.1
      }
    );
    // props.onHide();
  }

  const onClickRejectSponsorRequest = () => {
    rejectSponsorRequest(
      {
        ipfsKey: proposal.ipfsKey,
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
                {proposalDetail && proposalDetail.projectName || 'N/A'}
              </Header>
            </Col>
          </Row>
          <Row>

            <Col sm="12">

              <Address>
                {proposal?._contributor_address || 'N/A'}
              </Address>
            </Col>
          </Row>
          <Row style={{ alignItems: 'center' }}>
            <Col lg="1" xs="12">
              <Badge variant={proposalStatusMapping.find((mapping) => {
                return (mapping.name === status)
              })?.badgeColor}>{status}</Badge>{' '}
            </Col>

            {
              ((selectedTab) => {
                console.log(props.selectedTab);
                if (['Active', 'Paused'].includes(props.status))
                  return (
                    <>
                      <Col lg="3" xs="12">

                        <ProgressBar />
                      </Col>

                      <Col lg="3" xs="12" className={styles.progressTextContainer}>
                        {

                          <ProgressText>
                            46% Completed
                          </ProgressText>
                        }

                      </Col>
                    </>
                  )
                if (['Voting'].includes(props.status))
                  return (
                    <>
                      {/* <Col xs="12"> */}
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
                      {/* </Col> */}
                      <Col lg='1' xs ='12'></Col>
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
            <Description description={(proposalDetail && proposalDetail.description) || '<span>No Description</span>'} />
          </Col>

          {/* <Col lg="4" className = "d-none d-lg-block"> */}
          <Col lg="4" xs="12">
            <Col xs="12">
              <DetailsTable
                title={"Project Details"}
                data={
                  [
                    {
                      key: 'Category',
                      value: proposalDetail?.category || 'N/A'
                    },
                    {
                      key: 'Project Duration',
                      value: `${proposalDetail?.projectDuration} months` || 'N/A'
                    },
                    {
                      key: 'Total Budget',
                      value: `${icxFormat(proposalDetail?.totalBudget)} ICX` || 'N/A'
                    },
                    {
                      key: 'Sponsor Prep',
                      value: `${proposalDetail?.sponserPrep?.slice(0, 6)}...` || 'N/A'
                    },
                    {
                      key: 'Team Name',
                      value: `${proposalDetail?.teamName}` || 'N/A'
                    },
                    {
                      key: 'Team Email',
                      value: `${proposalDetail?.teamEmail}` || 'N/A'
                    },
                    {
                      key: 'Team Size',
                      value: `${proposalDetail?.teamSize}` || 'N/A'
                    },
                  ]
                }
              />
            </Col>
            {
              (proposalDetail?.milestones?.length > 0) &&
              <Col xs="12">
                <MilestoneTable
                  milestones={proposalDetail?.milestones} />
              </Col>
            }
          </Col>
        </Row>

        {
          sponsorRequest && (status === 'Pending') && (period === 'APPLICATION') && (remainingTime > 0) &&
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
            <Row style={{ justifyContent: 'center' }}>
              <ButtonGroup aria-label="Basic example">

                {
                  voteOptions.map(voteOption =>
                    <Button variant={vote === voteOption ? 'success' : 'light'} onClick={() => setVote(voteOption)}>{voteOption}</Button>
                  )

                }
              </ButtonGroup>


            </Row>
            <Row>
              <Col xs="12">
                <span>Explain in brief the reason behind your decision</span>
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
          </>
        }

        {
          !sponsorRequest &&
          <Row>
            <Col xs="12">
              {
                (status === 'Active' || status === 'Completed' || status === 'Paused') ?
                  (
                    <>
                      <ListTitle>Progress Reports</ListTitle>
                      <ProgressReportList
                        projectReports={progressReportByProposal} />
                    </>
                  ) :
                  (status === 'Voting') ?
                    <>
                      <ListTitle>VOTES</ListTitle>
                      <VoteList
                        votes={votesByProposal} />
                    </> :
                    null
              }

            </Col>
          </Row>
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
                <div style={{ color: 'red' }}>You will need to transfer {icxFormat(proposalDetail.totalBudget * 0.1, true)} ICX for sponsor bond.</div>
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
    proposalDetail: state.proposals.proposalDetail,
    progressReportByProposal: state.progressReport.progressReportByProposal,
    votesByProposal: state.proposals.votesByProposal,
    approvedPercentage: getProposalApprovedPercentage(state),
    approvedVoterPercentage: getProposalApprovedVotersPercentage(state),
    period: state.period.period,
    remainingTime: state.period.remainingTime
  }
)

const mapDispatchToProps = (dispatch) => (
  {
    fetchProposalDetail: payload => dispatch(fetchProposalDetailRequest(payload)),
    approveSponserRequest: payload => dispatch(approveSponserRequest(payload)),
    rejectSponsorRequest: payload => dispatch(rejectSponsorRequest(payload)),
    voteProposal: payload => dispatch(voteProposal(payload)),
    fetchVoteResultRequest: payload => dispatch(fetchVoteResultRequest(payload)),
    fetchProgressReportByProposalRequest: payload => dispatch(fetchProgressReportByProposalRequest(payload))
  }
)

export default connect(mapStateToProps, mapDispatchToProps)(DetailsModal);