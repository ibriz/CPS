import React, { useState, useEffect } from 'react';
import { Row, Card, Col, Form, InputGroup, FormControl, Button } from 'react-bootstrap';
import styles from './ProposalCreationPage.module.css';

import { submitProgressReportRequest, saveDraftRequest } from '../../Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
// import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import AppFormLabel from 'Components/UI/AppFormLabel';

import RichTextEditor from 'Components/RichTextEditor';

import LoaderModal from '../../Components/UI/LoaderModal';
// import {getCurrentUserActiveProposals} from 'Selectors';
import {fetchProposalListRequest, fetchProposalByAddressRequest} from 'Redux/Reducers/proposalSlice';
import {updateProposalStatus} from 'Redux/Reducers/proposalSlice';
import {NotificationManager} from 'react-notifications';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import Header from 'Components/Header';


const ProgressReportCreationPage = ({ submitProgressReport, history, submittingProgressReport, fetchProposalListRequest, updateProposalStatus, currentUserActiveProposals, saveDraftRequest, location, walletAddress, fetchProposalByAddressRequest }) => {


    const {
        draftProgressReport,
        isDraft
    } = location;
    const [progressReport, setProposal] = useState(
        {
            progressReportTitle: null,
            projectName: null,
            percentageCompleted: null,
            timeRemainingToCompletion: null,
            description: null,
            projectTermRevision: false,
            additionalBudget: null,
            additionalTime: null,
            revisionDescription: null,
            additionalResources: null,

        }
    );
    let [submissionConfirmationShow, setSubmissionConfirmationShow] = React.useState(false);


    useEffect(() => {
        // fetchProposalListRequest(
        //     {
        //         status: 'Active'
        //     }
        // );

        fetchProposalByAddressRequest(
            {
                walletAddress
            }
        )
    }, [])


    useEffect(() => {

        if(isDraft) {
            setProposal(prevState => (
                {
                    ...progressReport,
                    ...draftProgressReport,
                    projectName: draftProgressReport.proposalKey
                }
            ));
        }
    }, [location]);


    const saveChanges = () => {
        if(!progressReport.projectName) {
            NotificationManager.error("Please choose a project before saving");
            return;
        }
        if (isDraft) {
            saveDraftRequest({
                ...progressReport,
                address: walletAddress,
                proposalKey: progressReport.proposalKey,
                reportKey: progressReport.reportKey
            });
        }
        else {
            saveDraftRequest({
                ...progressReport,
                address: walletAddress,
                proposalKey: progressReport.projectName
            });
        }
        history.push('/');
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmissionConfirmationShow(true);
    }

    // useEffect(() => {
    //     ClassicEditor
    //         .create(document.querySelector('#editor1'), {
    //             ckfinder: {
    //                 uploadUrl: '/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
    //             },
    //             toolbar: ['ckfinder', 'imageUpload', '|', 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo']
    //         })
    //         .catch(error => {
    //             console.error(error);
    //         });
    // }, [])


    const handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.value

        setProposal(prevState =>
            ({
                ...prevState,
                [name]: value
            })
        );
    }

    const handleCheckedChange = (event) => {
        let name = event.target.name;
        let value = event.target.checked

        setProposal(prevState =>
            ({
                ...prevState,
                [name]: value
            })
        );
    }

    return (
        <div className={styles.proposalCreationPage}>
            <Header title = "Create New Progress Report"/>

            <Row className={styles.cardContainer}>
                <Card className={styles.card}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <AppFormLabel column sm="2">
                                Project Report Name
                            </AppFormLabel>
                            <Col sm="10" className={styles.inputSameLine}>
                                <Form.Control size="md" as="select" value={progressReport.projectName} name="projectName" onChange={handleChange} required>
                                    <option selected disabled value="">Select Project</option>
                                    {
                                        currentUserActiveProposals.map((proposal) => 
                                    <option value = {proposal.ipfsKey} disabled = {!proposal.newProgressReport}>{proposal._proposal_title}</option>
                                    

                                        )
                                    }
                                </Form.Control>                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <AppFormLabel column sm="2">
                                Progress Report Name
                            </AppFormLabel>
                            <Col sm="10" className={styles.inputSameLine}>
                                <Form.Control placeholder="Enter Progress Report Name" size="md" value={progressReport.progressReportTitle} name="progressReportTitle" onChange={handleChange} required />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">

                            <AppFormLabel column sm="2">
                                Percentage Completed
                            </AppFormLabel>
                            <Col sm="3" className="col-sm-2" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="0" type="number" min={0} max={100} value={progressReport.percentageCompleted} name="percentageCompleted" onChange={handleChange} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>
                            <AppFormLabel column sm="3" className={styles.labelSameLine}>
                                Time Remaining to Completion
                            </AppFormLabel>
                            <Col sm="4" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="0" type="number" value={progressReport.timeRemainingToCompletion} name="timeRemainingToCompletion" onChange={handleChange} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>Months</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <AppFormLabel column sm="12">
                                Description
                            </AppFormLabel>
                            <Col sm="12">
                                <RichTextEditor
                                    required
                                    onChange={(data) =>
                                        setProposal(prevState =>
                                            ({
                                                ...prevState,
                                                description: data
                                            })
                                        )
                                    } />
                            </Col>
                        </Form.Group>

                        {/* <Form.Group as={Row} controlId="formPlaintextEmail">
                            <AppFormLabel column sm="2">
                                Additional Resources
                            </AppFormLabel>

                            <Col sm="4" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Link to additional resources on IPFS"} size={"md"} value={progressReport.additionalResources} name="additionalResources" onChange={handleChange} required />
                            </Col>


                        </Form.Group> */}

                        <Form.Group as={Row} controlId="formPlaintextPassword">

                            <AppFormLabel column sm="2" >
                                Project Term Revision
                            </AppFormLabel>
                            <Col sm="4" className={styles.inputSameLine}>
                                <Form.Check
                                    checked={progressReport.projectTermRevision}
                                    onChange={handleCheckedChange}
                                    name="projectTermRevision"
                                    type="switch"
                                    id="custom-switch"
                                    label=""
                                    size="lg"
                                />
                            </Col>
                        </Form.Group>

                        {
                            progressReport.projectTermRevision &&
                            <>
                                <Form.Group as={Row} controlId="formPlaintextPassword">

                                    <AppFormLabel column sm="2" >
                                        Additional Budget
                            </AppFormLabel>
                                    <Col sm="4" className={styles.inputSameLine}>
                                        <InputGroup size="md">

                                            <FormControl placeholder="0" type="number" value={progressReport.additionalBudget} name="additionalBudget" onChange={handleChange} required />
                                            <InputGroup.Append>
                                                <InputGroup.Text>ICX</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Col>


                                    <AppFormLabel column sm="2" className={styles.labelSameLine}>
                                        Additional Time
                            </AppFormLabel>
                                    <Col sm="4" className={styles.inputSameLine}>
                                        <InputGroup size="md">

                                            <FormControl placeholder="0" type="number" value={progressReport.additionalTime} name="additionalTime" onChange={handleChange} required />
                                            <InputGroup.Append>
                                                <InputGroup.Text>Months</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Col>
                                </Form.Group>


                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <AppFormLabel column sm="12">
                                        Revision Description
                            </AppFormLabel>
                                    <Col sm="12">
                                        <RichTextEditor
                                            required
                                            onChange={(data) =>
                                                setProposal(prevState =>
                                                    ({
                                                        ...prevState,
                                                        revisionDescription: data
                                                    })
                                                )
                                            } />
                                    </Col>
                                </Form.Group>



                            </>
                        }

                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className = {styles.draftButton}>
                                <Button variant="outline-info" onClick = {saveChanges}>SAVE CHANGES</Button>{' '}
                            </Col>
                            <Col className={styles.saveButton}>
                                <Button variant="info" type="submit">SUBMIT</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </Card>
            </Row>

            <LoaderModal
                show={submittingProgressReport}
            />

            <ConfirmationModal
                show={submissionConfirmationShow}
                onHide={() => setSubmissionConfirmationShow(false)}
                heading={'Progress Report Submission Confirmation'}
                onConfirm={() => {
                    submitProgressReport(
                        {
                            progressReport
                        }
                    )
                }} >
                {                 
                        <>
                            <div>Are you sure you want to submit the progress report?</div>
                        </> 
                }

            </ConfirmationModal>
        </div>
    )
}

const mapDispatchToProps = dispatch => (
    {
        submitProgressReport: (payload) => dispatch(submitProgressReportRequest(payload)),
        fetchProposalListRequest: (payload) => dispatch(fetchProposalListRequest(payload)),
        updateProposalStatus: payload => dispatch(updateProposalStatus(payload)),
        saveDraftRequest: payload => dispatch(saveDraftRequest(payload)),
        fetchProposalByAddressRequest: payload => dispatch(fetchProposalByAddressRequest(payload))

    }
);

const mapStateToProps = state => (
    {
        submittingProgressReport: state.progressReport.submittingProgressReport,
        currentUserActiveProposals: state.proposals.proposalByAddress,
        walletAddress: state.account.address
    }
)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProgressReportCreationPage));