import { Modal, Button, Form, Row, Col, InputGroup, FormControl, } from 'react-bootstrap';
import React, { useState } from 'react';
import ClassNames from 'classnames';
import { FiEdit2 } from 'react-icons/fi';
import styles from './UserInfoFormModal.module.scss';



const UserInfoFormModal = (props) => {

  const [userData, setUserData] = useState(
    {
      projectName: null,
      category: null,
      projectDuration: 0,
      totalBudget: 0,
      sponserPrep: null,
      description: null,
      milestones: [],
      teamName: null,
      teamEmail: null,
      teamSize: 0,
    }
  );

  let [submissionConfirmationShow, setSubmissionConfirmationShow] = React.useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmissionConfirmationShow(true);

  }

  const handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value

    setUserData(prevState =>
      ({
        ...prevState,
        [name]: value
      })
    );
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          User Registation
          </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>

          <Form.Group as={Row} controlId="formPlaintextEmail">
            <Form.Label column sm="2">
              First Name
            </Form.Label>
            <Col sm="4" className={styles.inputSameLine}>
              <Form.Control placeholder="Enter First Name" size="md" value={userData.projectName} name="projectName" onChange={handleChange} required />
            </Col>

            <Form.Label column sm="2">
              Last Name
            </Form.Label>
            <Col sm="4" className={styles.inputSameLine}>
              <Form.Control placeholder="Enter Last Name" size="md" value={userData.projectName} name="projectName" onChange={handleChange} required />
            </Col>
          </Form.Group>


          
          <Form.Group as={Row} controlId="formPlaintextEmail">
            <Form.Label column sm="2">
              Email
                            </Form.Label>
            <Col sm="10" className={styles.inputSameLine}>
              <Form.Control placeholder="Enter Email Address" size="md" type = "email" value={userData.projectName} name="projectName" onChange={handleChange} required />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formPlaintextEmail">
            <Col sm="12" className={styles.inputSameLine}>
              <Form.Check type="checkbox" label="Enable email notifications" checked = {userData.enableEmailNotifications} />
            </Col>
          </Form.Group>


          <Form.Group as={Row} controlId="formPlaintextPassword">

            <Col className={styles.saveButton}>
              <Button variant="info" type="submit">SUBMIT</Button>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserInfoFormModal;