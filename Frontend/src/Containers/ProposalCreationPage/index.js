import React, { useState, useEffect } from 'react';
import { Row, Card, Col, Form, InputGroup, FormControl, Button, Table, Alert } from 'react-bootstrap';
import styles from './ProposalCreationPage.module.css';

import { submitProposalRequest, saveDraftRequest } from 'Redux/Reducers/proposalSlice';
import { fetchPrepsRequest } from '../../Redux/Reducers/prepsSlice';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
// import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import AddMilestoneModal from './AddMilestoneModal';
import EditMileStoneModal from './EditMilestoneModal';
import ClassNames from 'classnames';

import { AiFillDelete } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import Header from 'Components/Header';

import RichTextEditor from '../../Components/RichTextEditor';

import LoaderModal from '../../Components/UI/LoaderModal';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import {requestIPFS} from 'Redux/Sagas/helpers';

const ProposalCreationPage = ({ submitProposal, history, submittingProposal, fetchPrepsRequest, preps, saveDraftRequest, walletAddress, location }) => {

    const {
        draftProposal,
        isDraft
    } = location;
    const [modalShow, setModalShow] = React.useState(false);
    let [submissionConfirmationShow, setSubmissionConfirmationShow] = React.useState(false);
    const [editModalShow, setEditModalShow] = React.useState(false);
    const [editModalIndex, setEditModalIndex] = React.useState();
    const [proposalIPFS, setProposalIPFS] = React.useState({});
    const [proposal, setProposal] = useState(
        {
            projectName: null,
            category: null,
            projectDuration: null,
            totalBudget: null,
            sponserPrep: null,
            description: null,
            milestones: [],
            teamName: null,
            teamEmail: null,
            teamSize: null,
        }
    );

    async function fetchDraft() {
        const proposalIPFS = await requestIPFS({
            hash: draftProposal.ipfsHash,
          //   method: 'GET'
          });

        setProposalIPFS(proposalIPFS);
    }

    useEffect(() => {
        fetchPrepsRequest();

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
        if(isDraft) {
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

    const saveChanges = () => {
        if (isDraft) {
            saveDraftRequest({
                ...proposal,
                address: walletAddress,
                proposalKey: proposal.proposalKey
            });
        }
        else {
            saveDraftRequest({
                ...proposal,
                address: walletAddress
            });
        }
        // history.push('/');
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

    return (
        <div className={styles.proposalCreationPage}>
            <Header title = "Create New Proposal"/>

            {/* <Row className={styles.newProposal}>
                Create New Proposal
            </Row> */}
            <Row className={styles.cardContainer}>
                <Card className={styles.card}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="2">
                                Project Name
                            </Form.Label>
                            <Col sm="10" className={styles.inputSameLine}>
                                <Form.Control placeholder="Project Name" size="md" value={proposal.projectName} name="projectName" onChange={handleChange} required />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextEmail">

                            <Form.Label column sm="2">
                                Category
                            </Form.Label>
                            <Col sm="4" className={ClassNames("col-sm-2", [styles.inputSameLine])}>
                                <Form.Control size="md" as="select" value={proposal.category} name="category" onChange={handleChange} required>
                                    <option selected disabled value = "">Select a category</option>

                                    <option>Infrastructure</option>
                                    <option>Development</option>
                                    <option>Community Activities</option>
                                    <option>Others</option>

                                </Form.Control>
                            </Col>
                            <Form.Label column sm="2" className={styles.labelSameLine}>
                                Project Duration
                            </Form.Label>
                            <Col sm="4" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="Project Duration" type="number" value={proposal.projectDuration} name="projectDuration" onChange={handleChange} min = {0} max = {6} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>Months</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>

                        </Form.Group>

                        <Form.Group as={Row} controlId="formPlaintextPassword">

                            <Form.Label column sm="2" >
                                Total Budget
                            </Form.Label>
                            <Col sm="4" className={styles.inputSameLine}>
                                <InputGroup size="md">

                                    <FormControl placeholder="Total Budget" min = {0} type="number" value={proposal.totalBudget} name="totalBudget" onChange={handleChange} required />
                                    <InputGroup.Append>
                                        <InputGroup.Text>ICX</InputGroup.Text>
                                    </InputGroup.Append>
                                </InputGroup>
                            </Col>


                            <Form.Label column sm="2" className={styles.labelSameLine}>
                                Sponser PRep
                            </Form.Label>
                            <Col sm="4" className={styles.inputSameLine}>
                                <Form.Control size="md" as="select" value={proposal.sponserPrep} name="sponserPrep" onChange={handleChange} required>
                                    <option disabled selected value = "">Select PREP</option>
                                    {
                                        preps.map(prep =>
                                            <option value={prep.address}>{prep.name}</option>

                                        )
                                    }
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="12">
                                Description
                            </Form.Label>
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

                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="12">
                                Milestones
                            </Form.Label>
                            <Col sm="12">
                                <Button variant="light" onClick={() => setModalShow(true)}>Add Milestone</Button>
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
                                    {
                                        proposal.milestones.map((milestone, index) =>
                                            <tr>
                                                <td>{milestone.name}</td>
                                                <td>{milestone.duration}</td>
                                                <td style={{ display: 'flex', justifyContent: 'center' }}> <AiFillDelete style = {{cursor: 'pointer'}} onClick={() => {
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
                                </tbody>
                            </Table>
                        }


                        <Form.Group as={Row} controlId="formPlaintextEmail">
                            <Form.Label column sm="2">
                                Team Name
                            </Form.Label>

                            <Col sm="3" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Team Name"} size={"md"} value={proposal.teamName} name="teamName" onChange={handleChange} required />
                            </Col>
                            <Form.Label column sm="2" className={styles.labelSameLine}>
                                Team Email
                            </Form.Label>

                            <Col sm="2" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Team Email"} type="email" size={"md"} value={proposal.teamEmail} name="teamEmail" onChange={handleChange} required />
                            </Col>
                            <Form.Label column sm="1" className={styles.labelSameLine}>
                                Team Size
                            </Form.Label>
                            <Col sm="2" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Team Size"} size={"md"} type="number" value={proposal.teamSize} name="teamSize" onChange={handleChange} required />
                            </Col>


                        </Form.Group>

                        <Alert variant={'warning'}>
                            Warning: You need to transfer 50 ICX to submit a proposal
                        </Alert>


                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className = {styles.draftButton}>
                                <Button variant="outline-info" onClick={saveChanges}>SAVE CHANGES</Button>{' '}
                            </Col>
                            <Col className={styles.saveButton}>
                                <Button variant="info" type="submit">SUBMIT</Button>
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
                            <div className = "text-danger">You need to submit 50 ICX to submit a proposal</div>
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
        saveDraftRequest: payload => dispatch(saveDraftRequest(payload))
    }
);

const mapStateToProps = state => (
    {
        submittingProposal: state.proposals.submittingProposal,
        preps: state.preps.preps,
        walletAddress: state.account.address
    }
)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProposalCreationPage));