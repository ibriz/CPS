import { Modal, Button, Form, Row, Col, InputGroup, FormControl, } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import ClassNames from 'classnames';
import { FiEdit2 } from 'react-icons/fi';
import styles from './UserInfoFormModal.module.scss';
import {connect} from 'react-redux';

import {submitUserDataRequest} from 'Redux/Reducers/userSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';


const UserInfoFormModal = ({user, submitUserDataRequest, setModalShow, address, ...props}) => {

  const [userData, setUserData] = useState(
    {
      firstName: null,
      lastName: null,
      email: null,
      enableEmailNotifications: false
    }
  );

  useEffect(() => 
    user && setUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      enableEmailNotifications: user.enableEmailNotifications
    })
  , [user])

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

  const handleCheckedChange = (event) => {
    let name = event.target.name;
    let value = event.target.checked

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
        <Modal.Title id="contained-modal-title-vcenter" style = {{color: "#262626"}}>
          User Registation
          </Modal.Title>
      </Modal.Header>
      <Modal.Body className = {styles.modalBody}>
        <Form onSubmit={handleSubmit}>

          <Form.Group as={Row} controlId="formPlaintextEmail">
            <Form.Label column sm="2">
              First Name
            </Form.Label>
            <Col sm="4" className={styles.inputSameLine}>
              <Form.Control placeholder="Enter First Name" size="md" value={userData.firstName} name="firstName" onChange={handleChange} required />
            </Col>

            <Form.Label column sm="2">
              Last Name
            </Form.Label>
            <Col sm="4" className={styles.inputSameLine}>
              <Form.Control placeholder="Enter Last Name" size="md" value={userData.lastName} name="lastName" onChange={handleChange} />
            </Col>
          </Form.Group>



          <Form.Group as={Row} controlId="formPlaintextEmail">
            <Form.Label column sm="2">
              Email
                            </Form.Label>
            <Col sm="10" className={styles.inputSameLine}>
              <Form.Control placeholder="Enter Email Address" size="md" type="email" value={userData.email} name="email" onChange={handleChange} required />
            </Col>
          </Form.Group>


          <Form.Group as={Row} controlId="formPlaintextEmail">
            <Form.Label column sm="2">
              Wallet Address
                            </Form.Label>
            <Col sm="10" className={ClassNames(styles.inputSameLine, styles.addressContainer)}>
              <span style = {{fontSize: '0.9rem'}}>{address}</span>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formPlaintextEmail">
            
            <Col sm="12">
              <Form.Check type="checkbox" label="Enable email notifications" checked={userData.enableEmailNotifications} onChange={handleCheckedChange} name="enableEmailNotifications"

              />
            </Col>
          </Form.Group>


          <Form.Group as={Row} controlId="formPlaintextPassword">

            <Col className={styles.saveButton}>
              <Button variant="info" type="submit">SUBMIT</Button>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>

      <ConfirmationModal
                show={submissionConfirmationShow}
                onHide={() => setSubmissionConfirmationShow(false)}
                heading={'User Data Submit Confirmation'}
                onConfirm={() => {
                  submitUserDataRequest(
                        {
                            userData
                        }
                    );
                  setModalShow(false);
                }} >
                {                 
                        <>
                            <div>Are you sure you want to submit the user data?</div>
                        </> 
                }

    </ConfirmationModal>
    </Modal>
  );
};

const mapStateToProps =  state => ({
  user: state.user,
  address: state.account.address
});

const mapDispatchToProps = {
  submitUserDataRequest
}

export default connect(mapStateToProps, mapDispatchToProps)(UserInfoFormModal);
