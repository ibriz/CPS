import React, { useState, useEffect } from "react";

import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import styles from "./AddMilestoneModal.module.css";
import RichTextEditor from "../../../Components/RichTextEditor";
import AppFormLabel from "../../../Components/UI/AppFormLabel";

function AddMilestoneModal(props) {
  const [milestone, setMilestone] = useState({
    name: null,
    duration: null,
    budget: null,
    description: null,
  });

  useEffect(() => {
    setMilestone({
      name: null,
      duration: null,
      budget: null,
      description: null,
    });
  }, [props.show]);

  const handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value;

    setMilestone((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
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
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Milestone</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className={styles.form}>
          <Form.Group as={Row} controlId="formPlaintextEmail">
            <AppFormLabel sm="2">Milestone Name</AppFormLabel>
            <Col sm="10" className={styles.inputSameLine}>
              <Form.Control
                placeholder="Enter Milestone Name"
                size="md"
                value={milestone.name}
                name="name"
                onChange={handleChange}
                required
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="formPlaintextEmail">
            <AppFormLabel column sm="2" className={styles.labelSameLine}>
              Duration
            </AppFormLabel>
            <Col sm="4" className={styles.inputSameLine}>
              <InputGroup size="md">
                <FormControl
                  placeholder="Duration"
                  type="number"
                  value={milestone.duration}
                  name="duration"
                  min={0}
                  max={6}
                  onChange={handleChange}
                  required
                />
                <InputGroup.Append>
                  <InputGroup.Text>Months</InputGroup.Text>
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

          <Form.Group as={Row} controlId="formPlaintextPassword">
            <Col className={styles.saveButton}>
              <Button variant="info" type="submit">
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
