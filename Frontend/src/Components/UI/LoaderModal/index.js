import React from 'react';

import { Modal, Spinner } from 'react-bootstrap';
import styles from './LoaderModal.module.css';

function LoaderModal(props) {
    return (
        <Modal
            {...props}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >

            <Modal.Body className = {styles.modalBody}>

                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>

                <span>Please Wait</span>

            </Modal.Body>

        </Modal>
    );
}

export default LoaderModal;