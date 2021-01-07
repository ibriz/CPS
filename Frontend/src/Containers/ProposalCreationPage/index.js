import React, { useState, useEffect } from 'react';
import { Row, Card, Col, Form, InputGroup, FormControl, Button, Table, Alert, Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import styles from './ProposalCreationPage.module.css';
import { fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest } from 'Redux/Reducers/fundSlice';

import { submitProposalRequest, saveDraftRequest } from 'Redux/Reducers/proposalSlice';
import { fetchPrepsRequest } from '../../Redux/Reducers/prepsSlice';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
// import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import AddMilestoneModal from './AddMilestoneModal';
import EditMileStoneModal from './EditMilestoneModal';
import ClassNames from 'classnames';

import { AiFillDelete, AiFillInfoCircle } from 'react-icons/ai';
import InfoIcon from 'Components/InfoIcon';
import { FiEdit2 } from 'react-icons/fi';
import Header from 'Components/Header';

import RichTextEditor from '../../Components/RichTextEditor';

import LoaderModal from '../../Components/UI/LoaderModal';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import { requestIPFS } from 'Redux/Sagas/helpers';
import useTimer from 'Hooks/useTimer';
import Popup from 'Components/Popup';

const signingInfoMessage = (
    <div className="text-information">
        <div>Note:</div>
        <div className="intendation">1) You need to transfer 50 ICX to submit a proposal.</div>
        <div className="intendation">2) You need to sign the transaction two times-
            <div className="intendation">i) First time: to verify the user identity while submitting the proposal data to the Backend (IPFS).</div>
            <div className="intendation">ii) Second time: to verify the user identity while saving the ipfs hash and to submit 50 ICX fee to the blockchain.</div>

        </div>
    </div>
)

const ProposalCreationPage = ({ submitProposal, history, submittingProposal, fetchPrepsRequest, preps, saveDraftRequest, walletAddress, location, fetchCPFScoreAddressRequest, fetchCPFRemainingFundRequest, cpfScoreAddress, cpfRemainingFunds }) => {

    const {
        draftProposal,
        isDraft
    } = location;
    const { period } = useTimer();
    const [modalShow, setModalShow] = React.useState(false);
    let [submissionConfirmationShow, setSubmissionConfirmationShow] = React.useState(false);
    let [draftConfirmationShow, setDraftConfirmationShow] = React.useState(false);

    const [editModalShow, setEditModalShow] = React.useState(false);
    const [editModalIndex, setEditModalIndex] = React.useState();
    const [proposalIPFS, setProposalIPFS] = React.useState({});

    const [descriptionWords, setDescriptionWords] = React.useState(0);
    const [descriptionCharacters, setDescriptionCharacters] = React.useState(0);
    const [totalNumberOfMonthsInMilestone, setTotalNumberOfMonthsInMilestone] = React.useState(0);


    useEffect(() => {
        fetchCPFRemainingFundRequest();
    }, [fetchCPFRemainingFundRequest, cpfScoreAddress]);

    const [proposal, setProposal] = useState(
        {
            projectName: null,
            category: null,
            projectDuration: null,
            totalBudget: null,
            sponserPrep: null,
            sponserPrepName: null,
            description: null,
            milestones: [],
            teamName: null,
            teamEmail: null,
            teamSize: null,
        }
    );



    useEffect(() => {
        setProposal(proposal => (
            {
                ...proposal,
                sponserPrepName: preps.find(prep => prep.address == proposal.sponserPrep)?.name
            }
        ))
    }, [proposal.sponserPrep])

    useEffect(() => {
        if (proposal.totalBudget == null) {
            document.getElementById("totalBudget").setCustomValidity(`Enter Total Budget between 0 and remaining CPF Fund (currently ${cpfRemainingFunds} ICX)`);
        }
        else if ((proposal.totalBudget < 0) || (proposal.totalBudget > parseInt(cpfRemainingFunds))) {
            document.getElementById("totalBudget").setCustomValidity(`Total Budget should be between 0 and CPF remaining Fund (currently  ${cpfRemainingFunds} ICX)`);

        } else {
            document.getElementById("totalBudget").setCustomValidity("");
        }

    }, [proposal.totalBudget]);

    useEffect(() => {
        const minimumNumberOfWords = 2;
        // const maximumNumberOfMilestones = 6;
        const totalMonths = proposal.milestones.reduce((sum, milestone) => sum + parseInt(milestone.duration), 0);
        setTotalNumberOfMonthsInMilestone(totalMonths);

        console.log("proposal.projectDuration", proposal.projectDuration)
        if (proposal.milestones.length < 1) {
            document.getElementById("milestones").setCustomValidity(`Please add milestones`);
        }
        else if (parseInt(totalMonths) != parseInt(proposal.projectDuration)) {
            console.log("mielstone", parseInt(totalMonths), parseInt(proposal.projectDuration))
            document.getElementById("milestones").setCustomValidity(`The total duration in milestones should equal to the project duration (currently ${proposal.projectDuration || 0} months)`);
        }
        else {
            document.getElementById("milestones").setCustomValidity(``);
        }

    }, [proposal.milestones, proposal.projectDuration])

    useEffect(() => {
        const minimumNumberOfWords = 10
        if (!proposal.description) {
            document.getElementById("description").setCustomValidity(`Please write a description of minimum ${minimumNumberOfWords} words.`);
        } else if (descriptionWords < minimumNumberOfWords) {
            document.getElementById("description").setCustomValidity(`Description should be a minimum of ${minimumNumberOfWords} words`);
        } else {
            document.getElementById("description").setCustomValidity(``);
        }
    }, [proposal.description, descriptionWords])

    async function fetchDraft() {
        const proposalIPFS = await requestIPFS({
            hash: draftProposal.ipfsHash,
            //   method: 'GET'
        });

        setProposalIPFS(proposalIPFS);
    }

    useEffect(() => {
        document.getElementById("teamEmail").onfocus = () => {
            document.getElementById("teamEmail").onblur = () => {
                document.getElementById("teamEmail").reportValidity();
                document.getElementById("teamEmail").onblur = () => {

                }
            }
        }

        fetchPrepsRequest();
        fetchCPFScoreAddressRequest();

    }, [])



    useEffect(() => {
        if (isDraft) {

            setProposal(prevState => (
                {
                    ...proposal,
                    ...proposalIPFS,
                    ...draftProposal
                }
            ));
        }
    }, [location, proposalIPFS])

    useEffect(() => {
        if (isDraft) {
            fetchDraft();
        }
    }, [location])



    // const [proposal, setProposal] = useState(
    //     {
    //         projectName: "AVC",
    //         category: "Development",
    //         projectDescription: null,
    //         projectDuration: 3,
    //         totalBudget: 10000,
    //         sponserPrep: 'hx0b047c751658f7ce1b2595da34d57a0e7dad357d',
    //         description: null,
    //         milestone: null,
    //         teamName: "sdasd",
    //         teamEmail: "dsfds@dfgsg",
    //         teamSize: 13,
    //     }
    // );

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmissionConfirmationShow(true);

    }

    const onClickSaveDraft = () => {
        let allGood = true;
        Object.keys(proposal).map(key => {
            if (document.getElementById(key) && key !== 'description' && key !== 'milestones') {
                console.log("keyProposal", key, proposal[key], document.getElementById(key).checkValidity())
                if ((!Array.isArray(proposal[key]) && proposal[key]) || (Array.isArray(proposal[key]) && proposal[key].length > 0)) {
                    if (!document.getElementById(key).checkValidity()) {
                        document.getElementById(key).reportValidity();
                        allGood = false;
                    }
                }
            } else {
                console.log("keyProposalNot", key)
            }

        })
        if (!allGood) {
            return;
        }
        setDraftConfirmationShow(true);
    }

    const saveChanges = () => {
        if (isDraft) {
            saveDraftRequest({
                ...proposal,
                address: walletAddress,
                proposalKey: proposal.ipfsKey,
                callBackAfterSigning: () => {
                    history.push('/proposals');

                }
            });
        }
        else {
            saveDraftRequest({
                ...proposal,
                address: walletAddress,
                callBackAfterSigning: () => {
                    history.push('/proposals');

                }
            });
        }
        // history.push('/proposals');
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
        if (name === "teamEmail") {
            return;
        }
        document.getElementById(name) && document.getElementById(name).reportValidity();
    }

    return (
        <div className={styles.proposalCreationPage}>
            <Header title="Create New Proposal" />

            {/* <Row className={styles.newProposal}>
                Create New Proposal
            </Row> */}
            <Row className={styles.cardContainer}>
                <Card className={styles.card}>
                    <Form onSubmit={handleSubmit} id="form">
                        <Form.Group as={Row} >
                            <Form.Label column sm="2" >
                                Project Name
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="A suitable name for the project" /> */}
                            </Form.Label>

                            <Col sm="10" className={styles.inputSameLine}>
                                <Form.Control placeholder="Project Name" size="md" value={proposal.projectName} name="projectName" id="projectName" onChange={handleChange} required />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} >

                            <Form.Label column sm="2">
                                Category
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="The category the project falls into" /> */}
                            </Form.Label>
                            <Col sm="4" className={ClassNames("col-sm-2", [styles.inputSameLine])}>
                                <Form.Control size="md" as="select" value={proposal.category} name="category" id="category" onChange={handleChange} required>
                                    <option selected disabled value="">Select a category</option>

                                    <option>Infrastructure</option>
                                    <option>Development</option>
                                    <option>Community Activities</option>
                                    <option>Others</option>

                                </Form.Control>
                            </Col>
                            <Form.Label column sm="2" className={styles.labelSameLine}>
                                Project Duration
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="The expected time (in months) to complete the project (can be upto 6 months)" /> */}
                            </Form.Label>
                            <Col sm="4" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="Project Duration" type="number" value={proposal.projectDuration} name="projectDuration" id="projectDuration" onChange={handleChange} min={0} max={6} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>Months</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} >

                            <Form.Label column sm="2" >
                                Total Budget
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="The expected budget for the project." /> */}
                            </Form.Label>
                            <Col sm="4" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="Total Budget"
                                        min={0} max={parseInt(cpfRemainingFunds)}
                                        type="number" value={proposal.totalBudget} name="totalBudget" id="totalBudget" onChange={handleChange} id="totalBudget" required
                                    />
                                    <InputGroup.Append>
                                        <InputGroup.Text>ICX</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>


                            <Form.Label column sm="2" className={styles.labelSameLine}>
                                Sponsor PRep
                                <span className={styles.required}></span>
                                <InfoIcon description={<span>The Prep Sponsor for the project. Sponsor P-Rep will stake collateral for your proposal. You should communicate with the Sponsor P-Rep in advance to ensure they will accept sponsorship. You can choose a sponsor by first posting about your proposal in the ICON Forum where P-Reps can show interest in sponsoring your proposal.</span>} />
                            </Form.Label>
                            <Col sm="4" className={styles.inputSameLine}>
                                <Form.Control size="md" as="select" value={proposal.sponserPrep} name="sponserPrep" id="sponserPrep" onChange={handleChange} required>
                                    <option disabled selected value="">Select PREP</option>
                                    {
                                        preps.map(prep =>
                                            <option value={prep.address}>{prep.name}</option>

                                        )
                                    }
                                </Form.Control>
                            </Col>


                        </Form.Group>

                        <Form.Group as={Row} >
                            <Form.Label column sm="12">
                                Description
                                <span className={styles.required}></span>
                                <InfoIcon description="A detailed description for the project (minimum 100 words)" />
                            </Form.Label>
                            <Col sm="12" style={{ position: 'relative' }}>
                                <RichTextEditor
                                    required
                                    initialData={proposal.description ?? null}
                                    onChange={(data) =>
                                        setProposal(prevState =>
                                            ({
                                                ...prevState,
                                                description: data
                                            })
                                        )
                                    }
                                    setWords={setDescriptionWords}
                                    setCharacters={setDescriptionCharacters}
                                    onBlur={() => {
                                        document.getElementById("description").reportValidity();
                                    }}
                                >
                                </RichTextEditor>
                                <input className={styles.milestoneFakeInput} style={{ left: '15px' }} id="description" />



                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} >
                            <Form.Label column sm="12">
                                Milestones
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="Milestone for the project" /> */}
                            </Form.Label>
                            <Col sm="12" >
                                <Button variant="light" onClick={() => setModalShow(true)} style={{ position: 'relative' }}>Add Milestone <input className={styles.milestoneFakeInput} id="milestones" /></Button>
                            </Col>
                        </Form.Group>

                        {(proposal.milestones.length > 0) &&
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Milestone Name</th>
                                        <th>Duration</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                    {
                                        proposal.milestones.map((milestone, index) =>
                                            <tr>
                                                <td>{milestone.name}</td>
                                                <           td>{milestone.duration} month{milestone.duration > 1 && 's'}</td>
                                                <td style={{ display: 'flex', justifyContent: 'center' }}> <AiFillDelete style={{ cursor: 'pointer' }} onClick={() => {
                                                    setProposal(prevState => {
                                                        const newMilestone = [...prevState.milestones]
                                                        newMilestone.splice(index, 1);
                                                        return (
                                                            {
                                                                ...prevState,
                                                                milestones: newMilestone
                                                            }
                                                        )
                                                    })

                                                }} />

                                                    <FiEdit2 style={{ marginLeft: '10px', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            setEditModalShow(true);
                                                            setEditModalIndex(index);

                                                        }
                                                        } />
                                                </td>
                                            </tr>)

                                    }
                                                                                <tr>
                                                <td><b>TOTAL</b></td>
                                                <td><b>{totalNumberOfMonthsInMilestone} months</b></td>
                                            </tr>
                                            </>
                                </tbody>
                            </Table>
                        }


                        <Form.Group as={Row} >
                            <Form.Label column sm="2">
                                Team Name
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="Project Team Name" /> */}
                            </Form.Label>

                            <Col sm="3" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Team Name"} size={"md"} value={proposal.teamName} name="teamName" id="teamName" onChange={handleChange} required />
                            </Col>
                            <Form.Label column sm="2" className={styles.labelSameLine}>
                                Team Email
                                <span className={styles.required}></span>
                                {/* <InfoIcon description="Email of the Team" /> */}
                            </Form.Label>

                            <Col sm="2" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Team Email"} type="email" size={"md"} value={proposal.teamEmail} name="teamEmail" id="teamEmail" onChange={handleChange} required />
                            </Col>
                            <Form.Label column sm="1" className={styles.labelSameLine}>
                                Team Size
                                {/* <InfoIcon description="Size of the Team" /> */}
                            </Form.Label>
                            <Col sm="2" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Team Size"} size={"md"} type="number" value={proposal.teamSize} name="teamSize" min={0} id="teamSize" onChange={handleChange} />
                            </Col>


                        </Form.Group>

                        <Alert variant={'info'}>
                            {signingInfoMessage}


                        </Alert>

                        <Form.Group as={Row} >
                            <Col className={styles.draftButton}>
                                <Popup
                                    component={<Button variant="outline-info" onClick={onClickSaveDraft}>SAVE AS DRAFT</Button>}
                                    popOverText="Save changes and continue later."
                                    placement="right"
                                />
                            </Col>
                            <Col className={styles.saveButton}>
                                {
                                    period === "APPLICATION" ?
                                        <Button variant="info" type="submit">SUBMIT</Button>

                                        :
                                        //     <OverlayTrigger trigger="hover" placement="left"
                                        //     overlay={
                                        //         <Popover id="popover-basic" >
                                        //             <Popover.Content>
                                        //                 <span style = {{textAlign: 'center'}}>
                                        //                     You can submit in the next application period.
                                        //                 </span>
                                        //             </Popover.Content>
                                        //         </Popover>




                                        //     }
                                        // >
                                        //         <span className="d-inline-block">

                                        //             <Button variant="info" type="submit" disabled style={{ pointerEvents: 'none' }}>SUBMIT</Button>
                                        //         </span>

                                        //     </OverlayTrigger>

                                        <Popup
                                            component={<span className="d-inline-block">

                                                <Button variant="info" type="submit" disabled style={{ pointerEvents: 'none' }}>SUBMIT</Button>
                                            </span>}
                                            popOverText="You can submit in the next application period."
                                            placement="left"
                                        />
                                }
                            </Col>
                        </Form.Group>
                    </Form>
                </Card>
            </Row>

            <AddMilestoneModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onAddMilestone={milestone => {
                    setProposal(prevState => (
                        {
                            ...prevState,
                            milestones: [...prevState.milestones, milestone]
                        }
                    ))
                }

                }
            />

            <EditMileStoneModal
                show={editModalShow}
                onHide={() => setEditModalShow(false)}
                milestone={proposal.milestones[editModalIndex]}
                onAddMilestone={(milestone) => {
                    console.log("start");
                    setProposal((prevState) => (
                        {
                            ...prevState,
                            milestones: prevState.milestones.map((item, index) => {
                                if (index === editModalIndex) {
                                    return milestone;
                                } else {
                                    return item;
                                }
                            })
                        }
                    ));
                    console.log("end");
                }

                }
            />

            <LoaderModal
                show={submittingProposal}
            />

            <ConfirmationModal
                show={submissionConfirmationShow}
                onHide={() => setSubmissionConfirmationShow(false)}
                heading={'Proposal Submission Confirmation'}
                size="mdxl"
                onConfirm={() => {
                    submitProposal(
                        {
                            proposal
                        }
                    )
                }} >
                {
                    <>
                        <div>Are you sure you want to submit the proposal?</div>
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
        submitProposal: (payload) => dispatch(submitProposalRequest(payload)),
        fetchPrepsRequest: payload => dispatch(fetchPrepsRequest(payload)),
        saveDraftRequest: payload => dispatch(saveDraftRequest(payload)),

        fetchCPFScoreAddressRequest: payload => dispatch(fetchCPFScoreAddressRequest(payload)),
        fetchCPFRemainingFundRequest: payload => dispatch(fetchCPFRemainingFundRequest(payload)),
    }
);

const mapStateToProps = state => (
    {
        submittingProposal: state.proposals.submittingProposal,
        preps: state.preps.preps,
        walletAddress: state.account.address,
        cpfRemainingFunds: state.fund.cpfRemainingFunds,
        cpfScoreAddress: state.fund.cpfScoreAddress,
    }
)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProposalCreationPage));