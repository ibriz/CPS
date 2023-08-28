import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import ClassNames from 'classnames';
import { FiEdit2 } from 'react-icons/fi';
import styles from './UserInfoFormModal.module.scss';
import { connect } from 'react-redux';
import { AiFillCheckCircle } from 'react-icons/ai';
import {
  resendVerificationEmailRequest,
  disableUserPromptRequest,
} from 'Redux/Reducers/userSlice';

import { submitUserDataRequest } from 'Redux/Reducers/userSlice';
import ConfirmationModal from 'Components/UI/ConfirmationModal';

const UserInfoFormModal = ({
  user,
  submitUserDataRequest,
  setModalShow,
  address,
  verified,
  firstName,
  resendVerificationEmailRequest,
  initialPrompt,
  disableUserPromptRequest,
  ...props
}) => {
  const [userData, setUserData] = useState({
    firstName: null,
    lastName: null,
    email: null,
    enableEmailNotifications: false,
  });
  let [confirmationShow, setConfirmationShow] = React.useState(false);
  let [dontShowAgain, setDontShowAgain] = React.useState(false);

  useEffect(
    () =>
      user &&
      setUserData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        enableEmailNotifications: user.enableEmailNotifications,
      }),
    [user],
  );

  let [submissionConfirmationShow, setSubmissionConfirmationShow] =
    React.useState(false);

  const handleSubmit = event => {
    event.preventDefault();
    setSubmissionConfirmationShow(true);
  };

  const handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;

    setUserData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckedChange = event => {
    let name = event.target.name;
    let value = event.target.checked;

    setUserData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          id='contained-modal-title-vcenter'
          style={{ color: '#262626' }}
        >
          User Registration
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <Form variant='dark' onSubmit={handleSubmit}>
          <Form.Group as={Row} controlId='formPlaintextEmail'>
            <Form.Label column sm='2'>
              First Name
            </Form.Label>
            <Col sm='4' className={styles.inputSameLine}>
              <Form.Control
                placeholder='Enter First Name'
                size='md'
                value={userData.firstName}
                name='firstName'
                onChange={handleChange}
                required
              />
            </Col>

            <Form.Label column sm='2'>
              Last Name
            </Form.Label>
            <Col sm='4' className={styles.inputSameLine}>
              <Form.Control
                placeholder='Enter Last Name'
                size='md'
                value={userData.lastName}
                name='lastName'
                onChange={handleChange}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId='formPlaintextEmail'>
            <Form.Label column sm='2'>
              Email
            </Form.Label>
            <Col sm='10' className={styles.inputSameLine}>
              <Form.Control
                placeholder='Enter Email Address'
                size='md'
                type='email'
                value={userData.email}
                name='email'
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId='formPlaintextEmail'>
            <Form.Label column sm='2'>
              Wallet Address
            </Form.Label>
            <Col
              sm='10'
              className={ClassNames(
                styles.inputSameLine,
                styles.addressContainer,
              )}
            >
              <span className={styles.address}>{address}</span>
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId='formPlaintextEmail'>
            <Col sm='12'>
              <Form.Check
                type='checkbox'
                label='Enable email notifications'
                checked={userData.enableEmailNotifications}
                onChange={handleCheckedChange}
                name='enableEmailNotifications'
              />
            </Col>
          </Form.Group>

          {firstName &&
            (verified ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <AiFillCheckCircle
                  className='text-success'
                  style={{ fontSize: '18px', marginRight: '2px' }}
                />{' '}
                <span>Your email has been verified</span>
              </span>
            ) : (
              <>
                Your email has not been verified yet.
                <br /> Didn't receive email or the email link expired?{' '}
                <span
                  style={{ textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => setConfirmationShow(true)}
                >
                  Resend email confirmation
                </span>
              </>
            ))}

          {initialPrompt && (
            <Row>
              <Col sm='12'>
                <Form.Check
                  type='checkbox'
                  label="Don't show again."
                  checked={dontShowAgain}
                  onChange={event => setDontShowAgain(event.target.checked)}
                  name='enableEmailNotifications'
                />
              </Col>
            </Row>
          )}

          <Form.Group as={Row} controlId='formPlaintextPassword'>
            <Col>
              <Button
                variant='outline-info'
                onClick={() => {
                  if (initialPrompt) {
                    disableUserPromptRequest();
                  }
                  setModalShow(false);
                }}
              >
                CLOSE
              </Button>
            </Col>
            <Col className={styles.saveButton}>
              <Button variant='info' type='submit'>
                SUBMIT
              </Button>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>

      <ConfirmationModal
        show={confirmationShow}
        onHide={() => setConfirmationShow(false)}
        heading={'Resend Email Verification Confirmation'}
        onConfirm={() => {
          resendVerificationEmailRequest();
          setModalShow(false);
        }}
      >
        {
          <>
            <div>Are you sure you want to resend verification email?</div>
          </>
        }
      </ConfirmationModal>

      <ConfirmationModal
        show={submissionConfirmationShow}
        onHide={() => setSubmissionConfirmationShow(false)}
        heading={'User Data Submit Confirmation'}
        onConfirm={() => {
          submitUserDataRequest({
            userData,
          });
          setModalShow(false);

          if (initialPrompt) {
            disableUserPromptRequest();
          }
        }}
      >
        {
          <>
            <div>Are you sure you want to submit the user data?</div>
          </>
        }
      </ConfirmationModal>
    </Modal>
  );
};

const mapStateToProps = state => ({
  user: state.user,
  address: state.account.address,
  verified: state.user.verified,
  firstName: state.user.firstName,
});

const mapDispatchToProps = {
  submitUserDataRequest,
  resendVerificationEmailRequest,
  disableUserPromptRequest,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserInfoFormModal);
