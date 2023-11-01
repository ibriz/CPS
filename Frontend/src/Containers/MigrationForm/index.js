import React, { useState, useEffect } from 'react';
import {
  Row,
  Card,
  Col,
  Form,
  InputGroup,
  FormControl,
  Button,
  Table,
  Alert,
  Tooltip,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import styles from './ProposalCreationPage.module.css';
import {
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  fetchAvailableFundRequest,
  fetchRemainingSwapAmountRequest,
  fetchMaintenanceModeRequest,
} from 'Redux/Reducers/fundSlice';

import {
  submitMigrationProposalRequest,
  fetchProposalByIpfsRequest,
  saveDraftRequest,
    fetchProposalByAddressRequest,
} from 'Redux/Reducers/proposalSlice';
import { fetchPrepsRequest } from '../../Redux/Reducers/prepsSlice';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
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
import { specialCharacterMessage } from 'Constants';

const signingInfoMessage = (
  <div className='text-information'>
    <div>Note:</div>
    <div className='intendation'>
      1) Make sure you communicate with the Sponsor P-Rep in advance to ensure
      that they will accept your sponsorship request. You can communicate with
      P-Reps by posting about your proposal on{' '}
      <a
        style={{ color: 'inherit', textDecoration: 'underline' }}
        href='https://forum.icon.community/c/contribution-proposals/45'
        target='_blank'
      >
        ICON Forum
      </a>{' '}
      before creating a proposal on the CPS platform.
    </div>
    <div className='intendation'>
      2) You need to sign the transaction two times-
      <div className='intendation'>
        i) First time: to verify the user identity while submitting the proposal
        data to the Backend (IPFS).
      </div>
      <div className='intendation'>
        ii) Second time: to verify the user identity while saving the ipfs hash
      </div>
    </div>
  </div>
);

const initialDescription = `
<h3 id="summary">Summary</h3>

<h4 id="teamdescription">Team description</h4>

<p><em>In-depth summary of team, including specialties, reference projects or contacts (contact must agree to provide information before being listed here)</em></p>

<h4 id="projectdescription">Project description</h4>

<p><em>In-depth summary of project, including motivation, services and deliverables proposed, expected engagement, total requested budget and benefit to the greater ICON Ecosystem</em></p>

<h4 id="roadmap">Roadmap</h4>

<p><em>Clearly formatted table. Projects applying for CPS funding should have roadmaps made in accordance with 30 day funding cycles. Please see <a href="https://github.com/icon-community/CPS/wiki/Funding-Cycle-Explanation">this explanation</a> of CPS funding cycles and how it may affect development and disbursement of funding</em></p>

<p>Expected start date: <em>start date</em></p>

<h4 id="deliverables">Deliverables</h4>

<p><em>Deliverables projected for project</em></p>

<p><strong>Deliverables</strong>

<table>
<thead>
  <tr>
    <th>Name</th>
		<th>Explanation</th>
		<th>Notes</th>
  </tr>
	</thead>
	<tbody>
  <tr>
    <td>Example 1</td>
    <td>ICON ecosystem needs a better tool for this. It has been requested via community poll and provides these benefits</td>
    <td>This is based on the existing tool from Cosmos called 123xyz</td>
  </tr>
	<tr>
		<td>Example 2</td>
		<td>This facilitates a better experience using Example 1 tool. It would be great to have, but it is technically not necessary for Example Task to be performed adequately</td>
		<td>This is a visual tool</td>
	</tr>
	</tbody>

</table>

<h4 id="maintenance">Maintenance</h4>

<p><em>In-depth explanation of maintenance plan</em></p>

<h4 id="budget">Budget</h4>

<p><em>Budget for project. Funding for CPS grants is available in <a href="https://balanced.network/stablecoin/">bnUSD (stablecoin)</a>. Funding for ICON Foundation grants is available in ICX or USD</em></p>

<p><strong>Budget</strong></p>

<table>
<thead>
  <tr>
    <th>Source</th>
    <th>Amount</th>
    <th>Time [days]</th>
		<th>Notes</th>
  </tr>
	</thead>
	<tbody>
  <tr>
    <td>Person 1</td>
    <td>USD 7000</td>
    <td>60 days</td>
		<td>This is the project lead</td>
  </tr>
	<tr>
		<td>Person 2</td>
		<td>USD 6000</td>
		<td>60 days</td>
		<td>This is the second developer</td>
	</tr>
	<tr>
		<td>Service 1</td>
		<td>USD 500</td>
		<td>45 days</td>
		<td>This is the service for providing X. It is necessary for the testing phaser</td>
	</tr>
	<tr>
		<td>Service 2</td>
		<td>USD 100</td>
		<td>30 days</td>
		<td>This is the service for providing Y. It is necessary for communications and marketing</td>
	</tr>
	</tbody>
</table>

<h4 id="guidelines">Guidelines</h4>

<p>ICON ecosystem projects should abide by the guidelines made available from the following sources:</p>

<ul>
<li><a href="https://github.com/icon-project/community/tree/main/guidelines">ICON Community Guidelines</a></li>
</ul>

<h4>Deliverable conformance agreement</h4>

<p><strong>In order for your project to be funded, you are agreeing to conform to the best practices of software, product development, and professional conduct as explained by the sources above.</strong></p>

`;

const MigrationForm = ({
  submitMigrationProposal,
  history,
  submittingProposal,
  currentUserActiveProposals,
  fetchPrepsRequest,
  preps,
  saveDraftRequest,
  walletAddress,
  location,
  fetchProposalByAddressRequest,
  fetchProposalByIpfsRequest,
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  cpfTreasuryScoreAddress,
  cpfRemainingFunds,
  fetchAvailableFundRequest,
  fetchRemainingSwapAmountRequest,
  availableFund,
  actualAvailableFund,
  isMaintenanceMode,
  fetchMaintenanceModeRequest,
  remainingSwapAmount,
}) => {
  const { draftProposal, isDraft } = location;
  const { period } = useTimer();
  const [modalShow, setModalShow] = React.useState(false);
  let [submissionConfirmationShow, setSubmissionConfirmationShow] =
  React.useState(false);
  let [draftConfirmationShow, setDraftConfirmationShow] = React.useState(false);
  const isDarkTheme = localStorage.getItem('theme');
  const [editModalShow, setEditModalShow] = React.useState(false);
  const [editModalIndex, setEditModalIndex] = React.useState();
  const [proposalIPFS, setProposalIPFS] = React.useState({});
  const [selectedIPFSHash,setSelectedIPFSHash] = React.useState();
  const [descriptionWords, setDescriptionWords] = React.useState(0);
  const [descriptionCharacters, setDescriptionCharacters] = React.useState(0);
  const [totalNumberOfMonthsInMilestone, setTotalNumberOfMonthsInMilestone] =
  React.useState(0);
  let [prepList, setPrepList] = React.useState([]);
  // const [milestoneCount, setMilestoneCount] = useState(proposal.milestones.length);
  const [proposal, setProposal] = useState({
    oldIpfsKey:null,
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
  });


  useEffect(() => {
    fetchProposalByAddressRequest({
      walletAddress,
    });
  }, []);
  useEffect(() => {
    fetchCPFRemainingFundRequest();
  }, [fetchCPFRemainingFundRequest]);

  useEffect(() => {
    fetchCPFTreasuryScoreAddressRequest();
    fetchRemainingSwapAmountRequest();
  }, [
    cpfTreasuryScoreAddress,
    fetchRemainingSwapAmountRequest,
    fetchCPFTreasuryScoreAddressRequest,
  ]);

  useEffect(() => {
    fetchMaintenanceModeRequest();
  }, [fetchMaintenanceModeRequest]);

  useEffect(() => {
    let prepList = preps?.slice();
    prepList = prepList?.sort(function (a, b) {
      if (a?.name?.toLowerCase() < b?.name?.toLowerCase()) return -1;
      if (a?.name?.toLowerCase() > b?.name?.toLowerCase()) return 1;
      return 0;
    });
    setPrepList(prepList);
  }, [preps]);



  useEffect(() => {
    if (proposal.projectName) {
      // console.log("this is hash", progressReport.projectName);
      fetchProposalByIpfsRequest({ ipfs_key: proposal.projectName });
      console.log('executing this line');
      // fetchSelectedProposalForProgressReportRequest({
      //   hash: progressReport.projectName,
      // });
    }
  }, [proposal.projectName]);

  useEffect(() => {
    setProposal(proposal => ({
      ...proposal,
      sponserPrepName: preps.find(prep => prep.address == proposal.sponserPrep)
        ?.name,
    }));
  }, [proposal.sponserPrep]);

  useEffect(() => {
    if (proposal.totalBudget == null) {
      document.getElementById('totalBudget').setCustomValidity(
        // `Enter Total Budget between 0 and ${remainingSwapAmount} bnUSD`,
        `Please enter total budget`,
      );
    } else if (
      proposal.totalBudget < 0 ||
      proposal.totalBudget > remainingSwapAmount
    ) {
      document
        .getElementById('totalBudget')
        .setCustomValidity(
          `Total Budget should be between 0 and ${remainingSwapAmount} bnUSD`,
        );
    } else {
      document.getElementById('totalBudget').setCustomValidity('');
    }
  }, [proposal.totalBudget, remainingSwapAmount]);

  useEffect(() => {
    const minimumNumberOfWords = 2;
    // const maximumNumberOfMilestones = 6;
    const totalMonths = proposal.milestones.reduce(
      (sum, milestone) => sum + parseInt(milestone.duration),
      0,
    )/30;
    setTotalNumberOfMonthsInMilestone(totalMonths);

    console.log('proposal.projectDuration', proposal.projectDuration);
    if (proposal.milestones.length < 1) {
      document
        .getElementById('milestones')
        .setCustomValidity(`Please add milestones`);
    } else if (parseInt(totalMonths) != parseInt(proposal.projectDuration)) {
      console.log(
        'mielstone',
        parseInt(totalMonths),
        parseInt(proposal.projectDuration),
      );
      document
        .getElementById('milestones')
        .setCustomValidity(
          `The total duration in milestones should equal to the project duration (currently ${
            proposal.projectDuration || 0
          } months)`,
        );
    } else {
      document.getElementById('milestones').setCustomValidity(``);
    }
  }, [proposal.milestones, proposal.projectDuration]);

  useEffect(() => {
    const minimumNumberOfWords = 10;
    if (!proposal.description) {
      document
        .getElementById('description')
        .setCustomValidity(
          `Please write a description of minimum ${minimumNumberOfWords} words.`,
        );
    } else if (descriptionWords < minimumNumberOfWords) {
      document
        .getElementById('description')
        .setCustomValidity(
          `Description should be a minimum of ${minimumNumberOfWords} words`,
        );
    } else {
      document.getElementById('description').setCustomValidity(``);
    }
  }, [proposal.description, descriptionWords]);

  async function fetchIPFSProposal() {
    const proposalIPFS = await requestIPFS({
      hash: selectedIPFSHash,
    });

    setProposalIPFS(proposalIPFS);
  }
 
  useEffect(() => {
    document.getElementById('teamEmail').onfocus = () => {
      document.getElementById('teamEmail').onblur = () => {
        document.getElementById('teamEmail').reportValidity();
        document.getElementById('teamEmail').onblur = () => {};
      };
    };

    fetchPrepsRequest();
    fetchCPFTreasuryScoreAddressRequest();
  }, []);

  useEffect(() => {
    if (proposalIPFS) {
      setProposal(prevState => ({
        ...proposal,
        ...proposalIPFS,
      }));
    }
  }, [ proposalIPFS]);

  useEffect(() => {
    if (selectedIPFSHash) {
      fetchIPFSProposal();
      console.log("==================================",selectedIPFSHash);
    }
  }, [selectedIPFSHash]);

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

  const handleSubmit = event => {
    event.preventDefault();
    console.log(proposal);
    setSubmissionConfirmationShow(true);
  };

  // const onClickSaveDraft = () => {
  //   let allGood = true;
  //   Object.keys(proposal).map(key => {
  //     if (
  //       document.getElementById(key) &&
  //       key !== 'description' &&
  //       key !== 'milestones'
  //     ) {
  //       console.log(
  //         'keyProposal',
  //         key,
  //         proposal[key],
  //         document.getElementById(key).checkValidity(),
  //       );
  //       if (
  //         (!Array.isArray(proposal[key]) && proposal[key]) ||
  //         (Array.isArray(proposal[key]) && proposal[key].length > 0)
  //       ) {
  //         if (!document.getElementById(key).checkValidity()) {
  //           document.getElementById(key).reportValidity();
  //           allGood = false;
  //         }
  //       }
  //     } else {
  //       console.log('keyProposalNot', key);
  //     }
  //   });
  //   if (!allGood) {
  //     return;
  //   }
  //   setDraftConfirmationShow(true);
  // };

  // const saveChanges = () => {
  //   if (isDraft) {
  //     saveDraftRequest({
  //       ...proposal,
  //       address: walletAddress,
  //       proposalKey: proposal.ipfsKey,
  //       callBackAfterSigning: () => {
  //         history.push('/dashboard');
  //       },
  //     });
  //   } else {
  //     saveDraftRequest({
  //       ...proposal,
  //       address: walletAddress,
  //       callBackAfterSigning: () => {
  //         history.push('/dashboard');
  //       },
  //     });
  //   }
  //   // history.push('/proposals');
  // };

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
  // const currentUserActiveProposals=[
  //   {
  //     ipfsKey:"adf42ttstg",
  //     _proposal_title:"CPS REfurbished",
  //     newProgressReport:false
  //   },
  //   {
  //     ipfsKey:"sdfgsdfg",
  //     _proposal_title:"Grant System",
  //     newProgressReport:false
  //   },
  //   {
  //     ipfsKey:"fhjmshsnh",
  //     _proposal_title:"UI System",
  //     newProgressReport:false
  //   },
  // ]

  const handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;

    if(name==='projectName'){
      setSelectedIPFSHash(value);
      setProposal({...proposal,oldIpfsKey:value})
    }
     console.log(name,value);
    setProposal(prevState => ({
      ...prevState,
      [name]: value,
    }));
    if (name === 'teamEmail') {
      return;
    }
    document.getElementById(name) &&
      document.getElementById(name).reportValidity();
  };

  useEffect(() => {
    fetchAvailableFundRequest();
  }, []);
  // console.log({remainingSwapAmount});
  return (
    <div className={styles.proposalCreationPage}>
      {/* <Header title='Create New Proposal' /> */}

      {/* <Row className={styles.newProposal}>
                Create New Proposal
            </Row> */}
      <Row className={styles.cardContainer}>
        <Card className={styles.card}>
          <Form onSubmit={handleSubmit} id='form'>
            <Form.Group as={Row}>
              <Form.Label column sm='2'>
                Project Name
                <span className={styles.required}></span>
                <InfoIcon
                  description={specialCharacterMessage('project name')}
                />
              </Form.Label>

              <Col sm='10' className={styles.inputSameLine}>
              <Form.Control
                  size='md'
                  as='select'
                  className={styles.inputBox}
                  value={proposal.projectName}
                  name='projectName'
                  controlId='projectName'
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value=''>
                    Select Project
                  </option>
                  {/* <option value="dasd">New Project</option> */}

                  {currentUserActiveProposals.map((proposal, index) => (
                    <option
                      key={index}
                      value={proposal.ipfsKey}
                      disabled={!proposal.newProgressReport}
                    >
                      {proposal._proposal_title}
                    </option>
                  ))}
                </Form.Control>{' '}
              </Col>
            </Form.Group>
            <Form.Group as={Row}>
              <Form.Label column sm='2'>
                Category
                <span className={styles.required}></span>
                {/* <InfoIcon description="The category the project falls into" /> */}
              </Form.Label>
              <Col
                sm='4'
                className={ClassNames('col-sm-2', [styles.inputSameLine])}
              >
                <Form.Control
                  size='md'
                  as='select'
                  className={styles.inputBox}
                  value={proposal.category}
                  name='category'
                  id='category'
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value=''>
                    Select a category
                  </option>

                  <option>Infrastructure</option>
                  <option>Development</option>
                  <option>Community Activities</option>
                  <option>Others</option>
                </Form.Control>
              </Col>
              <Form.Label column sm='2' className={styles.labelSameLine}>
                Project Duration
                <span className={styles.required}></span>
                {/* <InfoIcon description="The expected time (in months) to complete the project (can be upto 12 months)" /> */}
              </Form.Label>
              <Col sm='4' className={styles.inputSameLine}>
                <InputGroup size='md'>
                  <FormControl
                    placeholder='Project Duration'
                    type='number'
                    value={proposal.projectDuration}
                    name='projectDuration'
                    id='projectDuration'
                    className={styles.inputBox}
                    onChange={handleChange}
                    min={0}
                    max={12}
                    required
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>Months</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm='2'>
                Total Budget
                <span className={styles.required}></span>
                {/* <InfoIcon description="The expected budget for the project." /> */}
              </Form.Label>
              <Col sm='4' className={styles.inputSameLine}>
                <InputGroup size='md'>
                  <FormControl
                    placeholder={
                      'Total Budget' ||
                      `Available Fund (${remainingSwapAmount} bnUSD)`
                    }
                    // onInvalid={e => {
                    //   e.target.setCustomValidity(
                    //     `Total Budget should be between 0 and ${remainingSwapAmount} bnUSD`,
                    //   );
                    // }}
                    min={0}
                    max={remainingSwapAmount}
                    type='number'
                    className={styles.inputBox}
                    value={proposal.totalBudget}
                    name='totalBudget'
                    id='totalBudget'
                    onChange={handleChange}
                    required
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>bnUSD</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>

              <Form.Label column sm='2' className={styles.labelSameLine}>
                Sponsor PRep
                <span className={styles.required}></span>
                <InfoIcon
                  description={
                    <span>
                      The Prep Sponsor for the project. Sponsor P-Rep will stake
                      collateral for your proposal.{' '}
                      <b>
                        You should communicate with the Sponsor P-Rep in advance
                        to ensure they will accept sponsorship.
                      </b>{' '}
                      You can choose a sponsor by first posting about your
                      proposal in the ICON Forum where P-Reps can show interest
                      in sponsoring your proposal.
                    </span>
                  }
                />
              </Form.Label>
              <Col sm='4' className={styles.inputSameLine}>
                <Form.Control
                  size='md'
                  as='select'
                  className={styles.inputBox}
                  value={proposal.sponserPrep}
                  name='sponserPrep'
                  id='sponserPrep'
                  onChange={handleChange}
                  required
                >
                  <option disabled selected value=''>
                    Select PREP
                  </option>
                  {prepList?.map(prep => {
                    return (
                      <option value={prep?.address} key={prep?.address}>{`${
                        prep?.name
                      } (${prep?.address?.slice(0, 4)}...${prep?.address?.slice(
                        prep.address.length - 2,
                      )})`}</option>
                    );
                  })}
                </Form.Control>
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label column sm='12'>
                Description
                <span className={styles.required}></span>
                <InfoIcon description='A detailed description for the project (minimum 10 words)' />
              </Form.Label>
              <Col sm='12' style={{ position: 'relative' }}>
                <RichTextEditor
                  required
                  initialData={proposal.description ?? initialDescription}
                  onChange={data =>
                    setProposal(prevState => ({
                      ...prevState,
                      description: data,
                    }))
                  }
                  setWords={setDescriptionWords}
                  setCharacters={setDescriptionCharacters}
                  onBlur={() => {
                    document.getElementById('description').reportValidity();
                  }}
                  minimumNumberOfWords={10}
                ></RichTextEditor>
                <input
                  className={styles.milestoneFakeInput}
                  style={{ left: '15px' }}
                  id='description'
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row}>
              <Form.Label  column sm='12'>
                Milestones
                <span className={styles.required}></span>
                {/* <InfoIcon description="Milestone for the project" /> */}
              </Form.Label>
              <div className="pl-3 pr-3 w-100 overflow-auto mb-4">
              { (
              <Table bordered>
                <thead>
                  <tr>
                    <th>Milestone Name</th>
                    <th>Duration</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <>
                    {proposal.milestones.map((milestone, index) => (
                      <tr style={{height:'100%'}} key={index}>
                        <td>{milestone.name}</td>
                        <td>
                          {milestone.duration} day
                          {milestone.duration > 1 && 's'}
                        </td>
                        <td>{milestone.description}</td>
                        <td
                          style={{ }}
                        >
                          {' '}
                          <AiFillDelete
                            style={{ cursor: 'pointer',fontSize:'20px' }}
                            onClick={() => {
                              setProposal(prevState => {
                                const newMilestone = [...prevState.milestones];
                                newMilestone.splice(index, 1);
                                return {
                                  ...prevState,
                                  milestones: newMilestone,
                                };
                              });
                            }}
                          />
                          <FiEdit2
                            style={{ marginLeft: '10px', fontSize:'20px' , cursor: 'pointer' }}
                            onClick={() => {
                              setEditModalShow(true);
                              setEditModalIndex(index);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <b>TOTAL</b>
                      </td>
                      <td>
                        <b>{totalNumberOfMonthsInMilestone} month</b>
                      </td>
                    </tr>
                  </>
                </tbody>
              </Table>
            )}
              </div>
             
              <Col sm='12'>
                <Button
                  variant={isDarkTheme ==='dark' ? 'dark' : 'light'}
                  onClick={() => setModalShow(true)}
                  style={{ position: 'relative' }}
                >
                  Add Milestone{' '}
                  <input
                    className={styles.milestoneFakeInput}
                    id='milestones'
                  />
                </Button>
              </Col>
            </Form.Group>

            

            <Form.Group as={Row}>
              <Form.Label column sm='2'>
                Team Name
                <span className={styles.required}></span>
                {/* <InfoIcon description="Project Team Name" /> */}
              </Form.Label>

              <Col sm='3' className={styles.inputSameLine}>
                <Form.Control
                  className={styles.inputBox}
                  placeholder={'Team Name'}
                  size={'md'}
                  value={proposal.teamName}
                  name='teamName'
                  id='teamName'
                  onChange={handleChange}
                  required
                />
              </Col>
              <Form.Label column sm='2' className={styles.labelSameLine}>
                Team Email
                <span className={styles.required}></span>
                {/* <InfoIcon description="Email of the Team" /> */}
              </Form.Label>

              <Col sm='2' className={styles.inputSameLine}>
                <Form.Control
                  className={styles.inputBox}
                  placeholder={'Team Email'}
                  type='email'
                  size={'md'}
                  value={proposal.teamEmail}
                  name='teamEmail'
                  id='teamEmail'
                  onChange={handleChange}
                  required
                />
              </Col>
              <Form.Label column sm='1' className={styles.labelSameLine}>
                Team Size
                {/* <InfoIcon description="Size of the Team" /> */}
              </Form.Label>
              <Col sm='2' className={styles.inputSameLine}>
                <Form.Control
                  className={styles.inputBox}
                  placeholder={'Team Size'}
                  size={'md'}
                  type='number'
                  value={proposal.teamSize}
                  name='teamSize'
                  min={0}
                  id='teamSize'
                  onChange={handleChange}
                />
              </Col>
            </Form.Group>

            <Alert variant={'info'}>{signingInfoMessage}</Alert>

            <Form.Group as={Row}>
              {/* <Col className={styles.draftButton}>
                <Popup
                  component={
                    <Button variant='outline-info' onClick={onClickSaveDraft}>
                      SAVE AS DRAFT
                    </Button>
                  }
                  popOverText='Save changes and continue later.'
                  placement='right'
                />
              </Col> */}
              <Col className={styles.saveButton}>
                {period !== 'VOTING' && !isMaintenanceMode && (
                  <Button variant='info' type='submit'>
                    SUBMIT
                  </Button>
                )}
                {period === 'VOTING' && (
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
                    popOverText='You can submit in the next application period.'
                    placement='left'
                  />
                )}
                {isMaintenanceMode && period !== 'VOTING' && (
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
                    popOverText='You can submit after maintenance mode is over.'
                    placement='left'
                  />
                )}
              </Col>
            </Form.Group>
          </Form>
        </Card>
      </Row>

      <AddMilestoneModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        onAddMilestone={milestone => {
          setProposal(prevState => ({
            ...prevState,
            milestones: [...prevState.milestones, milestone],
            // milestoneCount: prevState.milestoneCount+1
          }));
        }}
      />

      <EditMileStoneModal
        show={editModalShow}
        onHide={() => setEditModalShow(false)}
        milestone={proposal.milestones[editModalIndex]}
        onAddMilestone={milestone => {
          console.log('start');
          setProposal(prevState => ({
            ...prevState,
            milestones: prevState.milestones.map((item, index) => {
              if (index === editModalIndex) {
                return milestone;
              } else {
                return item;
              }
            }),
          }));
          console.log('end');
        }}
      />

      <LoaderModal show={submittingProposal} />

      <ConfirmationModal
        show={submissionConfirmationShow}
        onHide={() => setSubmissionConfirmationShow(false)}
        heading={'Migration Confirmation'}
        size='mdxl'
        onConfirm={() => {
          submitMigrationProposal({
            proposal,
          });
        }}
      >
        {
          <>
            <div>Are you sure you want to submit the proposal for migration?</div>
            {signingInfoMessage}
          </>
        }
      </ConfirmationModal>

      {/* <ConfirmationModal
        show={draftConfirmationShow}
        onHide={() => setDraftConfirmationShow(false)}
        heading={'Draft Submission Confirmation'}
        onConfirm={() => {
          saveChanges();
        }}
      >
        {
          <>
            <div>Are you sure you want to save the changes?</div>
          </>
        }
      </ConfirmationModal> */}
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  submitMigrationProposal: payload => dispatch(submitMigrationProposalRequest(payload)),
  fetchPrepsRequest: payload => dispatch(fetchPrepsRequest(payload)),
  saveDraftRequest: payload => dispatch(saveDraftRequest(payload)),
  fetchProposalByIpfsRequest: payload =>
  dispatch(fetchProposalByIpfsRequest(payload)),
  fetchCPFTreasuryScoreAddressRequest: () =>
    dispatch(fetchCPFTreasuryScoreAddressRequest()),
  fetchCPFRemainingFundRequest: payload =>
    dispatch(fetchCPFRemainingFundRequest(payload)),
  fetchAvailableFundRequest: payload =>
    dispatch(fetchAvailableFundRequest(payload)),
  fetchRemainingSwapAmountRequest: () =>
    dispatch(fetchRemainingSwapAmountRequest()),
    fetchProposalByAddressRequest: payload =>
    dispatch(fetchProposalByAddressRequest(payload)),
  fetchMaintenanceModeRequest: () => dispatch(fetchMaintenanceModeRequest()),
});

const mapStateToProps = state => ({
  submittingProposal: state.proposals.submittingProposal,
  preps: state.preps.preps,
  currentUserActiveProposals: state.proposals.proposalByAddress,
  walletAddress: state.account.address,
  cpfRemainingFunds: state.fund.cpfRemainingFunds,
  cpfTreasuryScoreAddress: state.fund.cpfTreasuryScoreAddress,
  availableFund: state.fund.availableFund,
  actualAvailableFund: 0.98 * state.fund.availableFund,
  isMaintenanceMode: state.fund.isMaintenanceMode,
  remainingSwapAmount: 0.98 * state.fund.remainingSwapAmount,
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MigrationForm),
);
