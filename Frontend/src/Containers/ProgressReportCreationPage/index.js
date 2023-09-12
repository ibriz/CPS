import React, { useState, useEffect } from 'react';
import {
  Row,
  Card,
  Col,
  Form,
  InputGroup,
  FormControl,
  Button,
  Alert,
} from 'react-bootstrap';
import styles from './ProposalCreationPage.module.css';
import {
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  fetchMaintenanceModeRequest,
} from 'Redux/Reducers/fundSlice';

import {
  submitProgressReportRequest,
  saveDraftRequest,
} from '../../Redux/Reducers/progressReportSlice';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
// import SimpleUploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/simpleuploadadapter';
import AppFormLabel from 'Components/UI/AppFormLabel';

import RichTextEditor from 'Components/RichTextEditor';

import LoaderModal from '../../Components/UI/LoaderModal';
// import {getCurrentUserActiveProposals} from 'Selectors';
import {
  fetchProposalByIpfsRequest,
  fetchProposalListRequest,
  fetchProposalByAddressRequest,
} from 'Redux/Reducers/proposalSlice';
import { updateProposalStatus } from 'Redux/Reducers/proposalSlice';
import { NotificationManager } from 'react-notifications';
import ConfirmationModal from 'Components/UI/ConfirmationModal';
import Header from 'Components/Header';
import { requestIPFS } from 'Redux/Sagas/helpers';
import InfoIcon from 'Components/InfoIcon';
import Popup from 'Components/Popup';
import useTimer from 'Hooks/useTimer';
import { specialCharacterMessage } from 'Constants';

const signingInfoMessage = (
  <div className='text-information'>
    <div>Note:</div>
    <div className='intendation'>
      You need to sign the transaction two times-
      <div className='intendation'>
        i) First time: to verify the user identity while submitting the progress
        report data to the Backend (IPFS).
      </div>
      <div className='intendation'>
        ii) Second time: to verify the user identity while saving the ipfs hash
        to the blockchain.
      </div>
    </div>
  </div>
);

const initialDescription = `
<h3 id="summary">Summary</h3>
<p><em>In-depth summary of project status, including sentiment, roadmap / timing, engagement so far, feedback to ICON Foundation or community, major issues / roadblocks</em></p>
<h4 id="amendments-to-roadmap">Amendments to roadmap</h4>
<p><em>Clearly formatted table. For <a href="https://cps.icon.community">CPS</a> projects, please see <a href="https://github.com/icon-community/CPS/wiki/Project-Activity-Flow-States">this explanation</a> of the possible states of the project and how they may affect development.</em></p>
<p><strong>Roadmap amendments</strong>
|<table>
<thead>
<tr>
<th>Name</th>
<th>Change</th>
<th>Explanation</th>
<th>Dependants</th>
</tr>
</thead>
<tbody>
<tr>
<td>Milestone 1</td>
<td>Change date to July 3 from August 3</td>
<td>We found a dangerous bug in the main code runner, so fixing this became a priority. Bug detailed <a href="https://example.com">here</a>.</td>
<td>Milestone 3</td>
</tr>
<tr>
<td>Milestone 2</td>
<td>Change date from September 1 to August 10</td>
<td>This looks to be easier than expected and is nearly complete</td>
<td>None</td>
</tr>
<tr>
<td>Milestone 3</td>
<td>Change date from September 10 to October 1</td>
<td>Milestone 1 has been moved back by 1 month, so this moves back by 20 days to account for this</td>
<td>None</td>
</tr>
</tbody>
</table>
<h4 id="amendments-to-budget">Amendments to budget</h4>
<p><em>As of now, <a href="https://cps.icon.community">CPS</a> projects may not request amendments to the originally proposed budget</em></p>
<p><em>All budget amendment requests must provide strict and logical reasoning. The requester is susceptible to denial of request for budget amendment if the grant provider does not perceive this request to provide sufficient reason. Funding for CPS grants is available in <a href="https://balanced.network/stablecoin/">bnUSD (stablecoin)</a>. Funding for ICON Foundation grants is available in ICX or USD</em></p>
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
<td>ICX 7000</td>
<td>10 days</td>
<td>This is the second developer. They will be necessary for an extra 10 days due to the change in expected completion date for Milestone 1 in the Roadmap Amendments</td>
</tr>
<tr>
<td>Service 1</td>
<td>ICX 100</td>
<td>20 days</td>
<td>This is the service for providing X. It will be necessary for an extra 20 days due to the change in expected completion date for Milestone 3 in the Roadmap Amendments</td>
</tr>
</tbody>
</table>
<h4 id="deliverables">Deliverables</h4>
<h4 id="accomplished-this-cycle">Accomplished this cycle</h4>
<p><em>Which deliverables are ready now? Deliverable states are denoted in the development guidelines listed in the <a href="#Conformance-summary">Conformance summary section</a></em></p>
<p><strong>Deliverables ready</strong>
<table>
<thead>
<tr>
<th>Name</th>
<th>Development State</th>
<th>Notes</th>
<th>Source / location</th>
</tr>
</thead>
<tbody>
<tr>
<td>Example 1</td>
<td>Beta</td>
<td>This needs to be debugged based on usage, but may be released</td>
<td><a href="https://github.com">Github repo</a></td>
</tr>
<tr>
<td>Example 2</td>
<td>Release</td>
<td>This has been developed and sufficiently debugged</td>
<td><a href="https://example.com">Webapp</a></td>
</tr>
<tr>
<td>Example 3</td>
<td>Release</td>
<td>This is a marketing effort</td>
<td>No direct link to source, but can be tracked on Twitter and Discord</td>
</tr>
</tbody>
</table>

<h4 id="projected-for-next-cycle">Projected for next cycle</h4>
<p><em>Which deliverables are projected to be ready next cycle?</em></p>
<p><strong>Deliverables projected for next cycle</strong>
<table>
<thead>
<tr>
<th>Name</th>
<th>Development State</th>
<th>Notes</th>
</tr>
</thead>
<tbody>
<tr>
<td>Example 1</td>
<td>Not started</td>
<td>This has not been started, but can be expected to be completed by the next progress report</td>
</tr>
<tr>
<td>Example 2</td>
<td>Alpha</td>
<td>This is currently being tested internally, and is expected to be in Beta by the next progress report cycle</td>
</tr>
</tbody>
</table>

<h4 id="conformance-summary">Conformance summary</h4>
<p>ICON ecosystem projects should abide by the guidelines made available from the following sources:</p>
<ul>
<li><a href="https://github.com/icon-project/community/tree/main/guidelines">ICON Community Guidelines</a></li>
</ul>
<h4 id="deliverable-conformance-agreement">Deliverable conformance agreement</h4>
<p><strong>In order for your project to be funded, you are agreeing to conform to the best practices of software, product development, and professional conduct as explained by the sources above.</strong></p>
<h4 id="instructions-to-run-tests">Instructions to run tests</h4>
<p><em>Summary of tests and corresponding instructions to run them</em></p>
<h4 id="link-to-license">Link to license</h4>
<p><em>Link to license file</em></p>
<h4 id="sample-of-docs">Sample of docs</h4>
<p><em>Link to documentations</em></p>
<h4 id="security-analysis">Security analysis</h4>
<p><em>Summary of security analysis and link to security analysis resources</em></p>
<h4 id="semantic-versioning-branching-analysis">Semantic versioning / branching analysis</h4>
<p><em>Link to semantic versioning / branching practices for analysis</em></p>

`;

const ProgressReportCreationPage = ({
  submitProgressReport,
  history,
  submittingProgressReport,
  fetchProposalListRequest,
  updateProposalStatus,
  currentUserActiveProposals,
  saveDraftRequest,
  location,
  walletAddress,
  fetchProposalByAddressRequest,
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  cpfTreasuryScoreAddress,
  cpfRemainingFunds,
  selectedProposal,
  fetchProposalByIpfsRequest,
  isMaintenanceMode,
  fetchMaintenanceModeRequest,
}) => {
  const { draftProgressReport, isDraft, ipfsKey } = location;
  const [progressReport, setProposal] = useState({
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
    isLastProgressReport: false,
  });
  const { period } = useTimer();
  const [progressReportIPFS, setProgressReportIPFS] = React.useState({});
  let [draftConfirmationShow, setDraftConfirmationShow] = React.useState(false);

  const isTimeRemainingNotZero =
    progressReport.timeRemainingToCompletion &&
    progressReport.timeRemainingToCompletion != 0;
  const isTaskRemaining =
    progressReport.percentageCompleted &&
    progressReport.percentageCompleted != 100;
  const isLastReport = currentUserActiveProposals.find(
    proposal => proposal.ipfsKey === progressReport.projectName,
  )?.lastProgressReport;

  const [descriptionWords, setDescriptionWords] = React.useState(0);
  const [descriptionCharacters, setDescriptionCharacters] = React.useState(0);

  const [revisionDescriptionWords, setRevisionDescriptionWords] =
    React.useState(0);
  const [revisionDescriptionCharacters, setRevisionDescriptionCharacters] =
    React.useState(0);

  const [options, setOptions] = React.useState([
    {
      name: 'Milestone 1',
      description: 'lorem ipsum dolor sit amet,',
      isChecked: false,
    },
    {
      name: 'Milestone 2',
      description: 'lorem ipsum  ',
      isChecked: false,
    },
  ]);
  const handleCheckboxChange = index => {
    setOptions(prevOptions =>
      prevOptions.map((option, i) =>
        i === index ? { ...option, isChecked: !option.isChecked } : option,
      ),
    );
  };

  const handleDescriptionChange = (index, description) => {
    setOptions(prevOptions =>
      prevOptions.map((option, i) =>
        i === index ? { ...option, description } : option,
      ),
    );
  };

  const handleMilestoneSubmit = index => {
    console.log('Submitted data:', options[index]);
  };

  useEffect(() => {
    fetchCPFRemainingFundRequest();
    fetchCPFTreasuryScoreAddressRequest();
  }, [
    fetchCPFRemainingFundRequest,
    cpfTreasuryScoreAddress,
    fetchCPFTreasuryScoreAddressRequest,
  ]);

  useEffect(() => {
    fetchMaintenanceModeRequest();
  }, [fetchMaintenanceModeRequest]);

  useEffect(() => {
    setProposal(prevState => ({
      ...prevState,
      isLastProgressReport: isLastReport,
    }));
  }, [currentUserActiveProposals, progressReport.projectName]);

  useEffect(() => {
    if (document.getElementById('additionalBudget')) {
      if (progressReport.additionalBudget == null) {
        document
          .getElementById('additionalBudget')
          .setCustomValidity(
            `Enter Additional Budget between 0 and remaining CPF Fund (currently ${cpfRemainingFunds} ICX)`,
          );
      } else if (
        progressReport.additionalBudget < 0 ||
        progressReport.additionalBudget > parseInt(cpfRemainingFunds)
      ) {
        document
          .getElementById('additionalBudget')
          .setCustomValidity(
            `Total Additional should be between 0 and CPF remaining Fund (currently  ${cpfRemainingFunds} ICX)`,
          );
      } else {
        document.getElementById('additionalBudget').setCustomValidity('');
      }
    }
  }, [progressReport.additionalBudget]);

  const onClickSaveDraft = () => {
    let allGood = true;
    Object.keys(progressReport).map(key => {
      if (
        document.getElementById(key) &&
        key !== 'description' &&
        key !== 'revisionDescription'
      ) {
        console.log(
          'keyProposal',
          key,
          progressReport[key],
          document.getElementById(key).checkValidity(),
        );
        if (
          (!Array.isArray(progressReport[key]) && progressReport[key]) ||
          (Array.isArray(progressReport[key]) && progressReport[key].length > 0)
        ) {
          if (!document.getElementById(key).checkValidity()) {
            document.getElementById(key).reportValidity();
            allGood = false;
          }
        }
      } else {
        console.log('keyProposalNot', key);
      }
    });
    if (!allGood) {
      return;
    }
    setDraftConfirmationShow(true);
  };

  let [submissionConfirmationShow, setSubmissionConfirmationShow] =
    React.useState(false);

  async function fetchDraft() {
    const progressReportIPFS = await requestIPFS({
      hash: draftProgressReport.reportHash,
      //   method: 'GET'
    });

    setProgressReportIPFS(progressReportIPFS);
  }

  useEffect(() => {
    setProposal(proposal => ({
      ...progressReport,
      projectName: ipfsKey,
    }));
  }, [ipfsKey]);

  useEffect(() => {
    if (isDraft) {
      fetchDraft();
    }
  }, [location]);

  useEffect(() => {
    // fetchProposalListRequest(
    //     {
    //         status: 'Active'
    //     }
    // );

    fetchProposalByAddressRequest({
      walletAddress,
    });
  }, []);

  useEffect(() => {
    if (isDraft) {
      setProposal(prevState => ({
        ...progressReport,
        ...draftProgressReport,
        ...progressReportIPFS,
        projectName: progressReportIPFS.projectName,
      }));
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
        proposalName: currentUserActiveProposals.find(
          proposal => proposal.ipfsKey === progressReport.projectName,
        )?._proposal_title,
        callBackAfterSigning: () => {
          history.push('/progress-reports');
        },
      });
    } else {
      saveDraftRequest({
        ...progressReport,
        address: walletAddress,
        proposalKey: progressReport.projectName,
        proposalName: currentUserActiveProposals.find(
          proposal => proposal.ipfsKey === progressReport.projectName,
        )?._proposal_title,
        callBackAfterSigning: () => {
          history.push('/progress-reports');
        },
      });
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    setSubmissionConfirmationShow(true);
  };

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

  const handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;

    setProposal(prevState => ({
      ...prevState,
      [name]: value,
    }));

    document.getElementById(name) &&
      document.getElementById(name).reportValidity();
  };

  useEffect(() => {
    if (progressReport.projectName) {
      fetchProposalByIpfsRequest({ ipfs_key: progressReport.projectName });
    }
  }, [progressReport.projectName]);

  useEffect(() => {
    if (
      selectedProposal?.approvedReports &&
      selectedProposal?.projectDuration
    ) {
      setProposal(prevState => ({
        ...prevState,
        timeRemainingToCompletion:
          Number(selectedProposal?.projectDuration) -
          Number(selectedProposal?.approvedReports),
      }));
    }
  }, [selectedProposal]);
  const handleCheckedChange = event => {
    let name = event.target.name;
    let value = event.target.checked;

    setProposal(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const minimumNumberOfWords = 10;

    if (!progressReport.description) {
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
  }, [progressReport.description, descriptionWords]);

  useEffect(() => {
    const minimumNumberOfWords = 10;

    if (progressReport.projectTermRevision) {
      if (!progressReport.revisionDescription) {
        document
          .getElementById('revisionDescription')
          .setCustomValidity(
            `Please write a revision description of minimum ${minimumNumberOfWords} words.`,
          );
      } else if (revisionDescriptionWords < minimumNumberOfWords) {
        document
          .getElementById('revisionDescription')
          .setCustomValidity(
            `Revision Description should be a minimum of ${minimumNumberOfWords} words`,
          );
      } else {
        document.getElementById('revisionDescription').setCustomValidity(``);
      }
    }
  }, [
    progressReport.revisionDescription,
    progressReport.projectTermRevision,
    revisionDescriptionWords,
  ]);

  return (
    <div className={styles.proposalCreationPage}>
      {/* <Header title='Create New Progress Report' /> */}

      <Row className={styles.cardContainer}>
        <Card className={styles.card}>
          <Form onSubmit={handleSubmit} className={styles.FormCard}>
            <Form.Group
              as={Row}
              controlId='formPlaintextEmail'
              className={styles.maxWidthLabel}
            >
              <AppFormLabel column lg='3'>
                Project Name
                <span className={styles.required}></span>
                {/* <InfoIcon description = "The project for which the progress report is being submitted"/>    */}
              </AppFormLabel>
              <Col lg='9' className={styles.inputSameLine}>
                <Form.Control
                  size='md'
                  as='select'
                  className={styles.inputBox}
                  value={progressReport.projectName}
                  name='projectName'
                  id='projectName'
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value=''>
                    Select Project
                  </option>
                  {/* <option value="dasd">New Project</option> */}

                  {currentUserActiveProposals.map(proposal => (
                    <option
                      value={proposal.ipfsKey}
                      disabled={!proposal.newProgressReport}
                    >
                      {proposal._proposal_title}
                    </option>
                  ))}
                </Form.Control>{' '}
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              controlId='formPlaintextEmail'
              className={styles.maxWidthLabel}
            >
              <AppFormLabel column lg='3'>
                Progress Report Name
                <span className={styles.required}></span>
                <InfoIcon
                  description={specialCharacterMessage('progress report name')}
                />
              </AppFormLabel>
              <Col lg='9' className={styles.inputSameLine}>
                <Form.Control
                  placeholder='Progress Report Name'
                  size='md'
                  className={styles.inputBox}
                  value={progressReport.progressReportTitle}
                  name='progressReportTitle'
                  id='progressReportTitle'
                  onChange={handleChange}
                  required
                />
              </Col>
            </Form.Group>
            <Form.Group
              as={Row}
              controlId='formPlaintextEmail'
              className={styles.maxWidthLabel}
            >
              <AppFormLabel column lg='3'>
                Percentage Completed
                <span className={styles.required}></span>
                {/* <InfoIcon description = "The completed percentage of the project"/>   */}
              </AppFormLabel>
              <Col lg='2' className={styles.inputSameLine}>
                <InputGroup size='md'>
                  <FormControl
                    placeholder='Percentage Completed'
                    type='number'
                    min={0}
                    max={100}
                    value={progressReport.percentageCompleted}
                    name='percentageCompleted'
                    id='percentageCompleted'
                    onChange={handleChange}
                    required
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
              <AppFormLabel column lg='3' className={styles.labelSameLine}>
                Time Remaining to Completion
                <span className={styles.required}></span>
                {/* <InfoIcon description = "The estimated remaining time for the project"/>   */}
              </AppFormLabel>
              <Col lg='3' className={styles.inputSameLine}>
                <InputGroup size='md'>
                  <FormControl
                    placeholder='Time Remaining'
                    type='number'
                    value={progressReport.timeRemainingToCompletion}
                    name='timeRemainingToCompletion'
                    id='timeRemainingToCompletion'
                    onChange={handleChange}
                    min={0}
                    max={6}
                    disabled
                    style={{ backgroundColor: 'white' }}
                    required
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>Months</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId='formPlaintextPassword'>
              <AppFormLabel column lg='12'>
                Description
                <InfoIcon description='A detailed description for the progress report (minimum 10 words)' />
                <span className={styles.required}></span>
              </AppFormLabel>
              <Col lg='12'>
                <RichTextEditor
                  required
                  initialData={progressReport.description ?? initialDescription}
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
                />
                <input
                  className={styles.fakeInput}
                  style={{ left: '15px' }}
                  id='description'
                />
              </Col>
            </Form.Group>
            <Form.Group
              as={Col}
              controlId='formPlaintextEmail'
              className={styles.maxWidthLabel}
            >
              <div className='d-flex'>
                <AppFormLabel sm='12' rows lg='3'>
                  Milestone Report
                  <span className={styles.required}></span>
                  {/* <InfoIcon description = "The completed percentage of the project"/>   */}
                </AppFormLabel>
                <Row>
                  {options.map((option, index) => (
                    <div
                      key={index}
                      class='d-flex custom-control custom-checkbox pl-4 pr-4'
                    >
                      <input
                        type='checkbox'
                        class='custom-control-input'
                        value={option.name} // Changed from option.value to option.name
                        checked={option.isChecked}
                        id={`customCheck${index}`}
                        onChange={() => handleCheckboxChange(index)}
                      />{' '}
                      <label
                        class='custom-control-label w-100 p-0'
                        for={`customCheck${index}`}
                      >
                        {option.name}
                      </label>
                    </div>
                  ))}
                </Row>
              </div>
              <div>
                {options.map(
                  (option, index) =>
                    option.isChecked && (
                      <div key={index} style={{ margin: '20px 0px  ' }}>
                        <AppFormLabel
                          column
                          sm='12'
                          className={styles.labelSameLine}
                        >
                          Description for {option.name}
                        </AppFormLabel>
                        <Col sm='12' className={styles.inputSameLine}>
                          <InputGroup size='md'>
                            <Form.Control
                              name='Description'
                              placeholder='Enter Milestone Description'
                              as='textarea'
                              rows={3}
                              onChange={handleChange}
                            />
                          </InputGroup>
                        </Col>
                        <Button
                          size='sm'
                          variant='info'
                          type='submit'
                          disabled
                          style={{ pointerEvents: 'none', marginTop: '8px' }}
                          onClick={() => handleMilestoneSubmit(index)}
                        >
                          Save
                        </Button>
                      </div>
                    ),
                )}
              </div>
            </Form.Group>

            {/* <Form.Group as={Row} controlId="formPlaintextEmail">
                            <AppFormLabel column lg="2">
                                Additional Resources
                            </AppFormLabel>

                            <Col lg="4" className={styles.inputSameLine}>
                                <Form.Control placeholder={"Link to additional resources on IPFS"} size={"md"} value={progressReport.additionalResources} name="additionalResources" onChange={handleChange} required />
                            </Col>


                        </Form.Group> */}

            {/* <Form.Group
              as={Row}
              controlId='formPlaintextPassword'
              className={styles.maxWidthLabelPTR}
            >
              <AppFormLabel column lg='3'>
                Project Terms Revision
                <span className={styles.required}></span>
                <InfoIcon description='Whether the project requires additional budget or additional time for completion' />
              </AppFormLabel>
              <Col lg='4' className={styles.inputSameLine}>
                <Form.Check
                  checked={progressReport.projectTermRevision}
                  onChange={handleCheckedChange}
                  name='projectTermRevision'
                  id='projectTermRevision'
                  type='switch'
                  id='custom-switch'
                  label=''
                  size='lg'
                />
              </Col>
            </Form.Group>

            {progressReport.projectTermRevision && (
              <>
                <Form.Group as={Row} controlId='formPlaintextPassword'>
                  <AppFormLabel column lg='2'>
                    Additional Budget
                    <span className={styles.required}></span>
                  </AppFormLabel>
                  <Col lg='4' className={styles.inputSameLine}>
                    <InputGroup size='md'>
                      <FormControl
                        placeholder='Additional Budget'
                        type='number'
                        value={progressReport.additionalBudget}
                        name='additionalBudget'
                        onChange={handleChange}
                        min={0}
                        required
                        id='additionalBudget'
                      />
                      <InputGroup.Append>
                        <InputGroup.Text>ICX</InputGroup.Text>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>

                  <AppFormLabel column lg='2' className={styles.labelSameLine}>
                    Additional Time
                    <span className={styles.required}></span>
                  </AppFormLabel>
                  <Col lg='4' className={styles.inputSameLine}>
                    <InputGroup size='md'>
                      <FormControl
                        placeholder='Additional Time'
                        type='number'
                        value={progressReport.additionalTime}
                        name='additionalTime'
                        id='additionalTime'
                        onChange={handleChange}
                        min={0}
                        max={6}
                        required
                      />
                      <InputGroup.Append>
                        <InputGroup.Text>Months</InputGroup.Text>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} controlId='formPlaintextPassword'>
                  <AppFormLabel column lg='12'>
                    Revision Description
                    <span className={styles.required}></span>
                    <InfoIcon description='Reason for requiring additional time and additional budget (minimum 10 words)' />
                  </AppFormLabel>
                  <Col lg='12'>
                    <RichTextEditor
                      required
                      initialData={progressReport.revisionDescription ?? null}
                      onChange={data =>
                        setProposal(prevState => ({
                          ...prevState,
                          revisionDescription: data,
                        }))
                      }
                      setWords={setRevisionDescriptionWords}
                      setCharacters={setRevisionDescriptionCharacters}
                      onBlur={() => {
                        document
                          .getElementById('revisionDescription')
                          .reportValidity();
                      }}
                      minimumNumberOfWords={10}
                    />
                    <input
                      className={styles.fakeInput}
                      style={{ left: '15px' }}
                      id='revisionDescription'
                    />
                  </Col>
                </Form.Group>
              </>
            )} */}

            <Alert variant={'info'}>{signingInfoMessage}</Alert>

            {isLastReport && (
              <Alert variant={'info'}>
                Note: This is the last progress report.
              </Alert>
            )}

            {isLastReport &&
              (isTimeRemainingNotZero || isTaskRemaining) &&
              !progressReport.projectTermRevision && (
                <Alert variant={'warning'}>
                  <span>Warning: This is the last progress report</span>

                  {isTaskRemaining && (
                    <span>
                      {' '}
                      and the completed percentage is{' '}
                      {progressReport.percentageCompleted}%
                    </span>
                  )}
                  {isTimeRemainingNotZero && (
                    <span>
                      {' '}
                      and the time remaining to completion is{' '}
                      {progressReport.timeRemainingToCompletion} months
                    </span>
                  )}

                  <span>. Do you consider having a project term revision?</span>
                </Alert>
              )}

            {isLastReport &&
              isTimeRemainingNotZero &&
              progressReport.projectTermRevision &&
              progressReport.timeRemainingToCompletion !==
                progressReport.additionalTime && (
                <Alert variant='primary'>
                  Note: Recommended additional time:{' '}
                  {progressReport.timeRemainingToCompletion} month (The time
                  remaining to completion).
                </Alert>
              )}

            <Form.Group as={Row} controlId='formPlaintextPassword'>
              <Col className={styles.draftButton}>
                <Popup
                  component={
                    <Button variant='outline-info' onClick={onClickSaveDraft}>
                      SAVE AS DRAFT
                    </Button>
                  }
                  popOverText='Save changes and continue later.'
                  placement='right'
                />
              </Col>
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

      <LoaderModal show={submittingProgressReport} />

      <ConfirmationModal
        show={submissionConfirmationShow}
        onHide={() => setSubmissionConfirmationShow(false)}
        heading={'Progress Report Submission Confirmation'}
        size='mdxl'
        onConfirm={() => {
          submitProgressReport({
            progressReport,
          });
        }}
      >
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
          saveChanges();
        }}
      >
        {
          <>
            <div>Are you sure you want to save the changes?</div>
          </>
        }
      </ConfirmationModal>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  submitProgressReport: payload =>
    dispatch(submitProgressReportRequest(payload)),
  fetchProposalListRequest: payload =>
    dispatch(fetchProposalListRequest(payload)),
  updateProposalStatus: payload => dispatch(updateProposalStatus(payload)),
  saveDraftRequest: payload => dispatch(saveDraftRequest(payload)),
  fetchProposalByAddressRequest: payload =>
    dispatch(fetchProposalByAddressRequest(payload)),

  fetchCPFTreasuryScoreAddressRequest: payload =>
    dispatch(fetchCPFTreasuryScoreAddressRequest(payload)),
  fetchCPFRemainingFundRequest: payload =>
    dispatch(fetchCPFRemainingFundRequest(payload)),
  fetchProposalByIpfsRequest: payload =>
    dispatch(fetchProposalByIpfsRequest(payload)),
  fetchMaintenanceModeRequest: () => dispatch(fetchMaintenanceModeRequest()),
});

const mapStateToProps = state => ({
  submittingProgressReport: state.progressReport.submittingProgressReport,
  // currentUserActiveProposals: [...state.proposals.proposalByAddress, {
  //     ipfsKey: 'adas',
  //     _proposal_title: 'New Proposal',
  //     newProgressReport: true
  // }],

  currentUserActiveProposals: state.proposals.proposalByAddress,
  walletAddress: state.account.address,

  cpfRemainingFunds: state.fund.cpfRemainingFunds,
  cpfTreasuryScoreAddress: state.fund.cpfTreasuryScoreAddress,
  selectedProposal: state.proposals.selectedProposal,
  isMaintenanceMode: state.fund.isMaintenanceMode,
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ProgressReportCreationPage),
);
