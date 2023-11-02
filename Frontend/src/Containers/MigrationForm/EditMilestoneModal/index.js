import React, { useState, useEffect } from 'react';

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import styles from './EditMilestoneModal.module.css';
import RichTextEditor from '../../../Components/RichTextEditor';
import AppFormLabel from '../../../Components/UI/AppFormLabel';

function EditMilestoneModal(props) {
  const id = Number(Date.now().toString().slice(-6));
  const [milestone, setMilestone] = useState({
    id: null,
    name: null,
    duration: null,
    // budget: null,
    description: null,
  });

  useEffect(() => {
    props.milestone &&
      setMilestone({
        id: props.milestone.id,
        name: props.milestone.name,
        duration: props.milestone.duration,
        // budget: props.milestone.budget,
        description: props.milestone.description,
      });
  }, [props.show, props.milestone]);

  const handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;

    setMilestone(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();

    props.onAddMilestone(milestone);
    props.onHide();
    // submitProposal(
    //     {
    //         proposal
    //     }
    // )
  };

  return (
    <Modal
      {...props}
      size='lg'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      contentClassName={styles['modal-content']}
    >
      <Modal.Header closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>Edit Milestone</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Col} controlId='formPlaintextEmail'>
          <Form.Label column sm='6' className={styles.textColor}>
              Title
            </Form.Label>
            <Col sm='12' className={styles.inputSameLine}>
              <Form.Control
               className={styles.inputBox}
                placeholder='Enter Milestone Name'
                size='md'
                value={milestone.name}
                name='name'
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>
          <Form.Group as={Col} controlId='formPlaintextEmail'>
          <Form.Label column sm='6' className={styles.textColor}>
              Duration
            </Form.Label>
            <Col sm='12' className={styles.inputSameLine}>
              <InputGroup size='md'>
                <FormControl
                 className={styles.inputBox}
                  placeholder='Duration in days'
                  type='number'
                  value={milestone.duration}
                  name='duration'
                  onChange={handleChange}
                  required
                />
                <InputGroup.Append>
                  <InputGroup.Text>Days</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Col>

            {/* <AppFormLabel column sm="1">
                            Budget
                            </AppFormLabel>
                        <Col sm="5" className={styles.inputSameLine}>
                            <InputGroup size="md">

                                <FormControl placeholder="0" type="number" value={milestone.budget} name="budget" onChange={handleChange} required />
                                <InputGroup.Append>
                                    <InputGroup.Text>ICX</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </Col> */}
          </Form.Group>
          <Form.Group as={Col} controlId='formPlaintextEmail'>
            <Form.Label column sm='6' className={styles.textColor}>
              Description
            </Form.Label>
            <Col sm='12' className={styles.inputSameLine}>
             
                <Form.Control
                  name='description'
                  value={milestone.description}
                  className={styles.inputBox}
                  placeholder='Enter Milestone Description'
                  as='textarea'
                  rows={5}
                  required
                  onChange={handleChange}
                />
            
            </Col>
          </Form.Group>

          {/* <Form.Group as={Row} controlId="formPlaintextPassword">
                        <AppFormLabel column sm="12">
                            Description
                            </AppFormLabel>
                        <Col sm="12">
                            <RichTextEditor
                                onChange={(data) =>
                                    setMilestone(prevState =>
                                        ({
                                            ...prevState,
                                            description: data
                                        })
                                    )
                                } />
                            </Col>
                    </Form.Group> */}

          <Form.Group as={Row} controlId='formPlaintextPassword'>
            <Col className={styles.saveButton}>
              <Button variant='info' type='submit'>
                EDIT MILESTONE
              </Button>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditMilestoneModal;
