import React, { useState, useEffect } from 'react';
import {findFutureMonth} from '../../../utils'
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import styles from './AddMilestoneModal.module.css';
import RichTextEditor from '../../../Components/RichTextEditor';
import AppFormLabel from '../../../Components/UI/AppFormLabel';

function AddMilestoneModal(props) {
  const id = Date.now().toString().slice(-6);
  const [milestone, setMilestone] = useState({
    id: null,
    name: null,
    completionPeriod: null,
    budget: null,
    description: null,
  });
  useEffect(() => {
    setMilestone({
      name: null,
      completionPeriod: null,
      budget: null,
      description: null,
    });
  }, [props.show]);

  const handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;

    setMilestone(prevState => ({
      ...prevState,
      [name]: value,
      id: id
    }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    // console.log({ milestone });
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
        <Modal.Title id='contained-modal-title-vcenter'>Add Milestone</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Col} controlId='formPlaintextEmail'>
            <Form.Label column   sm='6' className={styles.textColor}>
              Title
            </Form.Label>
            <Col sm='12' className={styles.inputSameLine}>
              <Form.Control
                placeholder='Enter Milestone Name'
                size='md'
                className={styles.inputBox}
                value={milestone.name}
                name='name'
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>
          <Form.Group as={Col} controlId='budgetandduration'>
            <Form.Group as={Row} controlId='formPlaintextEmail'>
            <Form.Group as={Col} controlId='formPlaintextEmail'>
              <Form.Label column className={styles.textColor}>
                Budget {`${props.remainingBudget ? `( remaining: ${props.remainingBudget} bnUSD)`:''}`}
              </Form.Label>
              <Col  className={styles.inputSameLine}>
                <InputGroup>
                  <Form.Control
                    placeholder='Enter Budget'
                    size='md'
                    type='number'
                    className={styles.inputBox}
                    value={milestone.budget}
                    name='budget'
                    onChange={handleChange}
                    required
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>bnUSD</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Form.Group>
            <Form.Group as={Col} controlId='formPlaintextEmail'>
              <Form.Label column className={styles.textColor}>
                Delivery Month
              </Form.Label>
              <Col className={styles.inputSameLine}>
                <InputGroup size='md'>
                  <Form.Control
                    placeholder='Enter completion period'
                    size='md'
                    type='number'
                    className={styles.inputBox}
                    value={milestone.completionPeriod}
                    name='completionPeriod'
                    onChange={handleChange}
                    required
                  />
                  <InputGroup.Append>
                    <InputGroup.Text>{findFutureMonth(milestone.completionPeriod)}</InputGroup.Text>
                  </InputGroup.Append>
                </InputGroup>
              </Col>
            </Form.Group>
          </Form.Group>
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
                ADD MILESTONE
              </Button>
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddMilestoneModal;
