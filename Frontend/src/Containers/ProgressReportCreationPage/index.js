import React, { useState, useEffect } from 'react';
import { Row, Card, Col, Form, InputGroup, FormControl, Button, Alert } from 'react-bootstrap';
import styles from './ProposalCreationPage.module.css';
import { fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest } from 'Redux/Reducers/fundSlice';

import { submitProgressReportRequest, saveDraftRequest } from '../../Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
// import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import AppFormLabel from 'Components/UI/AppFormLabel';

import RichTextEditor from 'Components/RichTextEditor';

import LoaderModal from '../../Components/UI/LoaderModal';
// import {getCurrentUserActiveProposals} from 'Selectors';
import { fetchProposalListRequest, fetchProposalByAddressRequest } from 'Redux/Reducers/proposalSlice';
import { updateProposalStatus } from 'Redux/Reducers/proposalSlice';
import { NotificationManager } from 'react-notifications';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import Header from 'Components/Header';
import { requestIPFS } from 'Redux/Sagas/helpers';
import InfoIcon from "Components/InfoIcon";
import Popup from 'Components/Popup';
import useTimer from 'Hooks/useTimer';

const signingInfoMessage = (
    <div className="text-information">
        <div>Note:</div>
        <div className="intendation">You need to sign the transaction two times-
            <div className="intendation">i) First time: to verify the user identity while submitting the progress report data to the Backend (IPFS).</div>
            <div className="intendation">ii) Second time: to verify the user identity while saving the ipfs hash to the blockchain.</div>

        </div>
    </div>
)

const ProgressReportCreationPage = ({ submitProgressReport, history, submittingProgressReport, fetchProposalListRequest, updateProposalStatus, currentUserActiveProposals, saveDraftRequest, location, walletAddress, fetchProposalByAddressRequest, fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest, cpfScoreAddress, cpfRemainingFunds }) => {


    const {
        draftProgressReport,
        isDraft,
        ipfsKey
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
            isLastProgressReport: false

        }
    );
    const {period} = useTimer();
    const [progressReportIPFS, setProgressReportIPFS] = React.useState({});
    let [draftConfirmationShow, setDraftConfirmationShow] = React.useState(false);

    const isTimeRemainingNotZero = progressReport.timeRemainingToCompletion && (progressReport.timeRemainingToCompletion != 0);
    const isTaskRemaining = progressReport.percentageCompleted && (progressReport.percentageCompleted != 100);
    const isLastReport = currentUserActiveProposals.find(proposal => proposal.ipfsKey === progressReport.projectName)?.lastProgressReport;

    const [descriptionWords, setDescriptionWords] = React.useState(0);
    const [descriptionCharacters, setDescriptionCharacters] = React.useState(0);

    const [revisionDescriptionWords, setRevisionDescriptionWords] = React.useState(0);
    const [revisionDescriptionCharacters, setRevisionDescriptionCharacters] = React.useState(0);

    useEffect(() => {
        fetchCPFRemainingFundRequest();
        fetchCPFScoreAddressRequest();

    }, [fetchCPFRemainingFundRequest, cpfScoreAddress, fetchCPFScoreAddressRequest]);

    useEffect(() => {
        setProposal(prevState =>
            ({
                ...prevState,
                isLastProgressReport: isLastReport
            })
        );
    }, [currentUserActiveProposals, progressReport.projectName]);


    useEffect(() => {
        if (document.getElementById("additionalBudget")) {
            if (progressReport.additionalBudget == null) {
                document.getElementById("additionalBudget").setCustomValidity(`Enter Additional Budget between 0 and remaining CPF Fund (currently ${cpfRemainingFunds} ICX)`);
            }
            else if ((progressReport.additionalBudget < 0) || (progressReport.additionalBudget > parseInt(cpfRemainingFunds))) {
                document.getElementById("additionalBudget").setCustomValidity(`Total Additional should be between 0 and CPF remaining Fund (currently  ${cpfRemainingFunds} ICX)`);

            } else {
                document.getElementById("additionalBudget").setCustomValidity("");
            }

        }

    }, [progressReport.additionalBudget])


    const onClickSaveDraft = () => {
        let allGood = true;
        Object.keys(progressReport).map(key => {
            if(document.getElementById(key) && key !== 'description' && key !== 'revisionDescription') {
                console.log("keyProposal", key, progressReport[key], document.getElementById(key).checkValidity())
                if((!Array.isArray(progressReport[key]) && progressReport[key]) || (Array.isArray(progressReport[key]) && progressReport[key].length > 0 )) {
                    if (!document.getElementById(key).checkValidity()) {
                        document.getElementById(key).reportValidity();
                        allGood = false;
                    }
                }
            } else {
                console.log("keyProposalNot",key)
            }

        })
        if(!allGood) {
            return;
        }
        setDraftConfirmationShow(true);
    }



    let [submissionConfirmationShow, setSubmissionConfirmationShow] = React.useState(false);

    async function fetchDraft() {
        const progressReportIPFS = await requestIPFS({
            hash: draftProgressReport.reportHash,
            //   method: 'GET'
        });

        setProgressReportIPFS(progressReportIPFS);
    }

    useEffect(() => {
        setProposal(proposal => (
            {
                ...progressReport,
                projectName: ipfsKey
            }
        ))
    }, [ipfsKey])

    useEffect(() => {
        if (isDraft) {
            fetchDraft();
        }
    }, [location])


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

        if (isDraft) {
            setProposal(prevState => (
                {
                    ...progressReport,
                    ...draftProgressReport,
                    ...progressReportIPFS,
                    projectName: progressReportIPFS.projectName
                }
            ));
        }
    }, [location, progressReportIPFS]);


    const saveChanges = () => {
        // if (!progressReport.projectName) {
        //     NotificationManager.error("Please choose a project before saving");
        //     return;
        // }
        if (isDraft) {
            saveDraftRequest({
                ...progressReport,
                address: walletAddress,
                proposalKey: progressReport.proposalKey,
                reportKey: progressReport.reportKey,
                proposalName: currentUserActiveProposals.find(proposal => proposal.ipfsKey === progressReport.projectName)?._proposal_title,
                callBackAfterSigning: () => {
                    history.push('/progress-reports');

                }
            });
        }
        else {
            saveDraftRequest({
                ...progressReport,
                address: walletAddress,
                proposalKey: progressReport.projectName,
                proposalName: currentUserActiveProposals.find(proposal => proposal.ipfsKey === progressReport.projectName)?._proposal_title,
                callBackAfterSigning: () => {
                    history.push('/progress-reports');

                }

            });
        }
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

        document.getElementById(name) && document.getElementById(name).reportValidity();

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

    useEffect(() => {
        const minimumNumberOfWords = 10;

        if(!progressReport.description) {
            document.getElementById("description").setCustomValidity(`Please write a description of minimum ${minimumNumberOfWords} words.`);
        } else if (descriptionWords < minimumNumberOfWords) {
            document.getElementById("description").setCustomValidity(`Description should be a minimum of ${minimumNumberOfWords} words`);
        } else{
            document.getElementById("description").setCustomValidity(``);

        }

    }, [progressReport.description, descriptionWords])

    useEffect(() => {
        const minimumNumberOfWords = 10;

        if (progressReport.projectTermRevision) {
            if(!progressReport.revisionDescription) {
                document.getElementById("revisionDescription").setCustomValidity(`Please write a revision description of minimum ${minimumNumberOfWords} words.`);
            } else if (revisionDescriptionWords < minimumNumberOfWords) {
                document.getElementById("revisionDescription").setCustomValidity(`Revision Description should be a minimum of ${minimumNumberOfWords} words`);
            } else {
                document.getElementById("revisionDescription").setCustomValidity(``);
            }
        }

    }, [progressReport.revisionDescription, progressReport.projectTermRevision, revisionDescriptionWords])

    return (
        <div className={styles.proposalCreationPage}>
            <Header title="Create New Progress Report" />

            <Row className={styles.cardContainer}>
                <Card className={styles.card}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} controlId="formPlaintextEmail" className = {styles.maxWidthLabel}>
                            <AppFormLabel column lg="3">
                                Project Name
                                <span className = {styles.required}></span>
                                {/* <InfoIcon description = "The project for which the progress report is being submitted"/>    */}
                            </AppFormLabel>
                            <Col lg="9" className={styles.inputSameLine}>
                                <Form.Control size="md" as="select" value={progressReport.projectName} name="projectName" id="projectName" onChange={handleChange} required>
                                    <option selected disabled value="">Select Project</option>
                                    {/* <option value="dasd">New Project</option> */}

                                    {
                                        currentUserActiveProposals.map((proposal) =>
                                            <option value={proposal.ipfsKey} disabled={!proposal.newProgressReport}>{proposal._proposal_title}</option>


                                        )
                                    }
                                </Form.Control>                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="formPlaintextEmail" className = {styles.maxWidthLabel}>
                            <AppFormLabel column lg="3">
                                
                                Progress Report Name
                                <span className = {styles.required}></span>
                                {/* <InfoIcon description = "A suitable name for the progress report"/>   */}
                            </AppFormLabel>
                            <Col lg="9" className={styles.inputSameLine}>
                                <Form.Control placeholder="Progress Report Name" size="md" value={progressReport.progressReportTitle} name="progressReportTitle" id="progressReportTitle" onChange={handleChange} required />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail" className = {styles.maxWidthLabel}>

                            <AppFormLabel column lg="3">
                                Percentage Completed
                                <span className = {styles.required}></span>
                                {/* <InfoIcon description = "The completed percentage of the project"/>   */}
                            </AppFormLabel>
                            <Col lg="" className="col-lg-2" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="Percentage Completed" type="number" min={0} max={100} value={progressReport.percentageCompleted} name="percentageCompleted" id="percentageCompleted" onChange={handleChange} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>
                            <AppFormLabel column lg="3" className={styles.labelSameLine}>
                                Time Remaining to Completion
                                <span className = {styles.required}></span>
                                {/* <InfoIcon description = "The estimated remaining time for the project"/>   */}
                            </AppFormLabel>
                            <Col lg="3" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="Time Remaining" type="number" value={progressReport.timeRemainingToCompletion} name="timeRemainingToCompletion" id="timeRemainingToCompletion" onChange={handleChange} min={0} max={6} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>Months</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <AppFormLabel column lg="12">
                                Description
                                <InfoIcon description = "A detailed description for the progress report (minimum 10 words)"/>  
                                <span className = {styles.required}></span>

                            </AppFormLabel>
                            <Col lg="12">
                                <RichTextEditor
                                    required
                                    initialData = {progressReport.description ?? null}
                                    onChange={(data) =>
                                        setProposal(prevState =>
                                            ({
                                                ...prevState,
                                                description: data
                                            })
                                        )
                                    }
                                    setWords = {setDescriptionWords}
                                    setCharacters = {setDescriptionCharacters}

                                    onBlur = {() => {
                                        document.getElementById("description").reportValidity();
                                    }}
                                    minimumNumberOfWords = {10}

                                    />
                        <input className = {styles.fakeInput} style = {{left: '15px'}} id = "description" />

                            </Col>
                        </Form.Group>

                        {/* <Form.Group as={Row} controlId="formPlaintextEmail">
                            <AppFormLabel column lg="2">
                                Additional Resources
                            </AppFormLabel>

                            <Col lg="4" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Link to additional resources on IPFS"} size={"md"} value={progressReport.additionalResources} name="additionalResources" onChange={handleChange} required />
                            </Col>


                        </Form.Group> */}

                        <Form.Group as={Row} controlId="formPlaintextPassword" className = {styles.maxWidthLabelPTR}>

                            <AppFormLabel column lg="3" >
                                Project Terms Revision
                                <span className = {styles.required}></span>
                                <InfoIcon description = "Whether the project requires additional budget or additional time for completion"/>  
                            </AppFormLabel>
                            <Col lg="4" className={styles.inputSameLine}>
                                <Form.Check
                                    checked={progressReport.projectTermRevision}
                                    onChange={handleCheckedChange}
                                    name="projectTermRevision"
                                    id="projectTermRevision"
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

                                    <AppFormLabel column lg="2" >
                                        Additional Budget
                                        <span className = {styles.required}></span>
                                        {/* <InfoIcon description = "Additional budget required (in ICX) for completion"/>   */}
                            </AppFormLabel>
                                    <Col lg="4" className={styles.inputSameLine}>
                                        <InputGroup size="md">

                                            <FormControl placeholder="Additional Budget" type="number" value={progressReport.additionalBudget} name="additionalBudget" onChange={handleChange} min={0} required
                                                id="additionalBudget" />
                                            <InputGroup.Append>
                                                <InputGroup.Text>ICX</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Col>


                                    <AppFormLabel column lg="2" className={styles.labelSameLine}>
                                        Additional Time
                                        <span className = {styles.required}></span>
                                        {/* <InfoIcon description = "Additional time required (in months) for completion"/>   */}
                                    </AppFormLabel>
                                    <Col lg="4" className={styles.inputSameLine}>
                                        <InputGroup size="md">

                                            <FormControl placeholder="Additional Time" type="number" value={progressReport.additionalTime} name="additionalTime" id="additionalTime" onChange={handleChange} min={0} max={6} required />
                                            <InputGroup.Append>
                                                <InputGroup.Text>Months</InputGroup.Text>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Col>
                                </Form.Group>


                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <AppFormLabel column lg="12">
                                        Revision Description
                                        <span className = {styles.required}></span>
                                        <InfoIcon description = "Reason for requiring additional time and additional budget (minimum 10 words)"/>  

                            </AppFormLabel>
                                    <Col lg="12">
                                        <RichTextEditor
                                            required
                                            initialData = {progressReport.revisionDescription ?? null}
                                            onChange={(data) =>
                                                setProposal(prevState =>
                                                    ({
                                                        ...prevState,
                                                        revisionDescription: data
                                                    })
                                                )
                                            }
                                            setWords = {setRevisionDescriptionWords}
                                            setCharacters = {setRevisionDescriptionCharacters}
                                            onBlur = {() => {
                                                document.getElementById("revisionDescription").reportValidity();
                                            }}
                                            minimumNumberOfWords = {10}

                                        />
                            <input className = {styles.fakeInput} style = {{left: '15px'}} id = "revisionDescription" />

                                    </Col>
                                </Form.Group>



                            </>
                        }

                        <Alert variant={'info'}>
                            {signingInfoMessage}


                        </Alert>

                        {
                            isLastReport &&
                            <Alert variant={'info'}>
                                Note: This is the last progress report.
                            </Alert>
                        }

                        {
                            isLastReport &&
                            ( isTimeRemainingNotZero || isTaskRemaining) &&
                            !progressReport.projectTermRevision &&
                            <Alert variant={'warning'}>
                                <span>Warning: This is the last progress report</span>

                                {
                                    isTaskRemaining &&
                                    <span> and the completed percentage is {progressReport.percentageCompleted}%</span>

                                }
                                {
                                    isTimeRemainingNotZero &&
                                    <span> and the time remaining to completion is {progressReport.timeRemainingToCompletion} months</span>
                                }

                                <span>. Do you consider having a project term revision?</span>
                            </Alert>
                        }

                        {
                            isLastReport && isTimeRemainingNotZero && progressReport.projectTermRevision && progressReport.timeRemainingToCompletion !== progressReport.additionalTime &&
                            <Alert variant = "primary">
                                Note: Recommended additional time: {progressReport.timeRemainingToCompletion} month (The time remaining to completion).
                            </Alert>
                        }

                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className={styles.draftButton}>
                                <Popup 
                                    component = {<Button variant="outline-info" onClick={onClickSaveDraft}>SAVE AS DRAFT</Button>}
                                    popOverText = "Save changes and continue later."
                                    placement = "right"
                                />
                            </Col>
                            <Col className={styles.saveButton}>
                                {
                                    period !== "VOTING" ?
                                        <Button variant="info" type="submit">SUBMIT</Button>

                                        :

                                    <Popup 
                                    component = {<span className="d-inline-block">

                                                 <Button variant="info" type="submit" disabled style={{ pointerEvents: 'none' }}>SUBMIT</Button>
                                             </span>}
                                    popOverText = "You can submit in the next application period."
                                    placement = "left"
                                    />
                                }
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
                size="mdxl"
                onConfirm={() => {
                    submitProgressReport(
                        {
                            ...progressReport,
                            description: progressReport.description.replace(/&nbsp;/g, ''),
                            revisionDescription: progressReport.revisionDescription.replace(/&nbsp;/g, '')
                        }
                    )
                }} >
                {
                    <>
                        <div>Are you sure you want to submit the progress report?</div>
                        {signingInfoMessage}
                    </>
                }

            </ConfirmationModal>

            <ConfirmationModal
                show={draftConfirmationShow}
                onHide={() => setDraftConfirmationShow(false)}
                heading={'Draft Submission Confirmation'}
                onConfirm={() => {
                    saveChanges()
                }} >
                {
                    <>
                        <div>Are you sure you want to save the changes?</div>
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
        fetchProposalByAddressRequest: payload => dispatch(fetchProposalByAddressRequest(payload)),

        fetchCPFScoreAddressRequest: payload => dispatch(fetchCPFScoreAddressRequest(payload)),
        fetchCPFRemainingFundRequest: payload => dispatch(fetchCPFRemainingFundRequest(payload)),

    }
);

const mapStateToProps = state => (
    {
        submittingProgressReport: state.progressReport.submittingProgressReport,
        // currentUserActiveProposals: [...state.proposals.proposalByAddress, {
        //     ipfsKey: 'adas',
        //     _proposal_title: 'New Proposal',
        //     newProgressReport: true
        // }],

        currentUserActiveProposals: state.proposals.proposalByAddress,
        walletAddress: state.account.address,

        cpfRemainingFunds: state.fund.cpfRemainingFunds,
        cpfScoreAddress: state.fund.cpfScoreAddress,
    }
)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProgressReportCreationPage));