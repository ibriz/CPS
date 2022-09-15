import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({
  heading = 'Confirmation Required',
  children = <span>Are you sure?</span>,
  onConfirm,
  size = 'md',
  ...props
}) => {
  return (
    <Modal
      {...props}
      aria-labelledby='contained-modal-title-vcenter'
      centered
      size={size}
      className={styles.confirmationModalCustom}
    >
      <Modal.Header bg-primary closeButton>
        <Modal.Title
          id='contained-modal-title-vcenter'
          className={styles.modalTitle}
        >
          {heading}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>{children}</Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button variant='secondary' onClick={props.onHide}>
          Cancel
        </Button>
        <Button
          variant='info'
          onClick={() => {
            onConfirm();
            props.onHide();
          }}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
