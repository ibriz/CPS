import React from 'react';
import { Form } from 'react-bootstrap';
import styles from './AppFormLabel.module.css';
import ClassNames from 'classnames';

const AppFormLabel = ({ labelSameLine, ...props }) => {
  return (
    <Form.Label
      column
      {...props}
      className={ClassNames({ [styles.labelSameLine]: labelSameLine })}
    >
      {props.children}
    </Form.Label>
  );
};

export default AppFormLabel;
